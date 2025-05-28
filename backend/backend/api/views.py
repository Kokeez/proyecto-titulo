from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status
from django.contrib.auth.models import User
from datetime import timedelta
from .serializers import LoginSerializer
from django.http import JsonResponse
from django.db.models import Sum
from datetime import datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from .models import Producto, Boleta, DetalleBoleta
from django.contrib.auth import get_user_model
from .serializers import ProductoSerializer
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import Boleta, DetalleBoleta, Producto
from .serializers import LineItemSerializer

from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models     import Producto
from .serializers import ProductoSerializer

User = get_user_model()

class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Autenticar al usuario
        user = authenticate(username=username, password=password)

        if user is not None:
            # Crear tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            # Establecer la expiración del access_token a 30 minutos
            access_token.set_exp(lifetime=timedelta(minutes=30))  # Establecer la expiración del token

            # Crear la respuesta con la información del usuario
            return Response({
                'refresh': str(refresh),  # El refresh token se convierte a string
                'access': str(access_token),  # El access token se convierte a string
                'user_id': user.id,
                'username': user.username,
                'is_admin': user.is_superuser,  # Verificar si es admin
                'photo_url': user.profile.photo_url if hasattr(user, 'profile') else None,  # Foto de perfil (si tienes un modelo de perfil)
            })
        else:
            return Response({'error': 'Credenciales Invalidas'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def listar_productos(request):
    qs = Producto.objects.all()
    ser = ProductoSerializer(qs, many=True, context={'request': request})
    return Response(ser.data)


@api_view(['GET'])
def listar_boletas(request):
    """
    Devuelve todas las boletas (ventas), con fecha, usuario y total.
    """
    qs = Boleta.objects.select_related('usuario') \
        .all().values(
            'id',
            'fecha',
            'total',
            'usuario__username'
        )
    return Response(list(qs))


@api_view(['GET'])
def detalle_boleta(request, boleta_id):
    """
    Recibe ?boleta_id=NN y devuelve las líneas de esa boleta.
    """
    lineas = DetalleBoleta.objects.filter(boleta_id=boleta_id) \
        .select_related('producto') \
        .values(
            'producto__nombre',
            'cantidad',
            'precio_unitario',
            'subtotal'
        )
    return Response({
        'boleta_id': boleta_id,
        'lineas': list(lineas)
    })




@api_view(['GET'])
def detalle_producto(request, producto_id):
    # Recupera el objeto o da 404
    producto = get_object_or_404(Producto, pk=producto_id)

    # Construye la URL completa de la imagen si existe
    if producto.imagen:
        imagen_url = request.build_absolute_uri(producto.imagen.url)
    else:
        imagen_url = None

    data = {
        'id': producto.id,
        'nombre': producto.nombre,
        'descripcion': producto.descripcion,
        'precio': float(producto.precio),
        'cantidad_disponible': producto.cantidad_disponible,
        'imagen_url': imagen_url,
    }
    return Response(data)

@api_view(['GET'])
def estadisticas_ventas(request):
    # Ventas por día (últimos 7 días)
    ventas_dias = (
        DetalleBoleta.objects
          .annotate(dia=TruncDay('boleta__fecha'))
          .values('dia')
          .annotate(total=Sum('subtotal'))
          .order_by('dia')
    )
    # Ventas por mes (año corriente)
    ventas_meses = (
        DetalleBoleta.objects
          .annotate(mes=TruncMonth('boleta__fecha'))
          .values('mes')
          .annotate(total=Sum('subtotal'))
          .order_by('mes')
    )
    return Response({
        'ventas_dias': list(ventas_dias),
        'ventas_meses': list(ventas_meses),
    })

@api_view(['GET'])
def buscar_productos_live(request):
    """
    GET /api/productos/search/?q=texto
    Devuelve hasta 10 productos cuyo nombre contenga 'texto'.
    """
    q = request.query_params.get('q', '').strip()
    if not q:
        return Response([], status=200)

    qs = Producto.objects.filter(nombre__icontains=q)[:10]
    ser = ProductoSerializer(qs, many=True, context={'request': request})
    return Response(ser.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    # LineItems: [{"product_id":1,"quantity":2}, ...]
    serializer = LineItemSerializer(data=request.data.get('items', []), many=True)
    serializer.is_valid(raise_exception=True)
    items = serializer.validated_data

    # Crea la boleta
    boleta = Boleta.objects.create(
        usuario=request.user,
        fecha=timezone.now(),
        total=0  # lo ajustaremos luego
    )

    total = 0
    for line in items:
        prod = Producto.objects.get(pk=line['product_id'])
        qty  = line['quantity']
        subtotal = prod.precio * qty

        # Crea cada línea
        DetalleBoleta.objects.create(
            boleta=boleta,
            producto=prod,
            cantidad=qty,
            precio_unitario=prod.precio,
            subtotal=subtotal
        )

        # Resta stock
        prod.cantidad_disponible = max(0, prod.cantidad_disponible - qty)
        prod.save()

        total += subtotal

    # Actualiza total de la boleta
    boleta.total = total
    boleta.save()

    return Response({
        'boleta_id': boleta.id,
        'fecha': boleta.fecha,
        'total': total,
    })

@api_view(['GET'])
def top_products(request):
    productos = (
        Producto.objects
                .annotate(total_vendido=Sum('detalleboleta__cantidad'))
                .order_by('-total_vendido')[:3]
    )

    data = []
    for p in productos:
        # si tiene imagen, construye la URL absoluta, si no, None
        imagen_url = (
            request.build_absolute_uri(p.imagen.url)
            if p.imagen and hasattr(p.imagen, 'url')
            else None
        )

        data.append({
            'id':          p.id,
            'nombre':      p.nombre,
            'descripcion': p.descripcion,
            'precio':      float(p.precio),
            'imagen_url':  imagen_url,
            'vendidas':    p.total_vendido or 0,
        })
    return Response(data)

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    parser_classes = [MultiPartParser, FormParser]

    def update(self, request, *args, **kwargs):
        """
        En el update, si no viene 'imagen' en el request, no lo sobreescribimos.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()

        # Si no vienen archivos nuevos, quitamos la clave para que DRF no la ponga a null
        if 'imagen' not in request.FILES and 'imagen' not in data:
            data.pop('imagen', None)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)