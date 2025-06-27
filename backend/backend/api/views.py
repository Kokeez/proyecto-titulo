from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status, generics, permissions
from django.contrib.auth.models import User
from datetime import timedelta
from django.http import JsonResponse
from django.db.models import Sum
from datetime import datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from .models import Producto, Boleta, DetalleBoleta, Servicio, Boleta, Vendedor
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import Boleta, DetalleBoleta, Producto, Producto

from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth import authenticate, get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from .serializers import (
    UsuarioSerializer,
    UsuarioRegistrationSerializer,
    VendedorSerializer,
    VehiculoSerializer,
    ProductoSerializer,
    ProductoSerializer,
    LoginSerializer,
    ServicioSerializer,
    BoletaSerializer,
    LineItemSerializer,
)

User = get_user_model()

"USUARIO EN GENERAL LOGIN, CRUD, ETC."
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UsuarioRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generar tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            access.set_exp(lifetime=timedelta(minutes=30))

            return Response({
                'refresh': str(refresh),
                'access': str(access),
                'user': UsuarioSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Vista para login con nickname + contraseña.
    Devuelve tokens JWT + datos del usuario.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        nickname = request.data.get('nickname') or request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, nickname=nickname, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            access.set_exp(lifetime=timedelta(minutes=30))
            return Response({
                'refresh': str(refresh),
                'access': str(access),
                'user': UsuarioSerializer(user).data
            })
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de Usuarios. Solo accesible por admins.
    """
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAdminUser]

    # Los campos modificables se definen en el serializer

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
          .filter(boleta__fecha_venta__gte='2025-06-01')  # Ajusta la fecha según tus necesidades
          .annotate(dia=TruncDay('boleta__fecha_venta'))
          .values('dia')
          .annotate(total=Sum('subtotal'))
          .order_by('dia')
    )

    # Ventas por mes (año corriente)
    ventas_meses = (
        DetalleBoleta.objects
          .filter(boleta__fecha_venta__year=2025)  # Ajusta el año según tus necesidades
          .annotate(mes=TruncMonth('boleta__fecha_venta'))
          .values('mes')
          .annotate(total=Sum('subtotal'))
          .order_by('mes')
    )

    # Ventas por tipo de producto/servicio
    ventas_tipo = (
        DetalleBoleta.objects
          .values('producto__tipo')  # Asumiendo que el producto tiene un campo 'tipo'
          .annotate(total=Sum('subtotal'))
    )

    # Ventas por vendedor
    ventas_vendedor = (
        Boleta.objects
          .values('vendedor__nombre')
          .annotate(total=Sum('total'))
    )

    # Ventas por estado de la boleta (Pagada/Pendiente/Anulada)
    ventas_estado = (
        Boleta.objects
          .values('estado')
          .annotate(total=Sum('total'))
    )

    return Response({
        'ventas_dias': list(ventas_dias),
        'ventas_meses': list(ventas_meses),
        'ventas_tipo': list(ventas_tipo),
        'ventas_vendedor': list(ventas_vendedor),
        'ventas_estado': list(ventas_estado),
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
    items = request.data.get('items', [])
    total = 0
    
    boleta = Boleta.objects.create(
        usuario=request.user,
        vendedor_id=request.data.get('vendedor'),  # Asigna el vendedor recibido
        fecha_venta=timezone.now(),
        total=0  # lo ajustaremos luego
    )
    
    for line in items:
        if line['type'] == 'producto':  # Si el item es un producto
            prod = Producto.objects.get(pk=line['product_id'])
            qty = line['quantity']
            subtotal = prod.precio * qty
            DetalleBoleta.objects.create(
                boleta=boleta,
                producto=prod,
                cantidad=qty,
                precio_unitario=prod.precio,
                subtotal=subtotal
            )
            prod.cantidad_disponible = max(0, prod.cantidad_disponible - qty)
            prod.save()
            total += subtotal
        
        elif line['type'] == 'servicio':  # Si el item es un servicio
            servicio = Servicio.objects.get(pk=line['product_id'])
            qty = line['quantity']
            subtotal = servicio.precio_base * qty
            DetalleBoleta.objects.create(
                boleta=boleta,
                servicio=servicio,
                cantidad=qty,
                precio_unitario=servicio.precio_base,
                subtotal=subtotal
            )
            total += subtotal

    boleta.total = total
    boleta.save()

    return Response({
        'boleta_id': boleta.id,
        'fecha': boleta.fecha_venta,
        'total': total,
    })



@api_view(['GET'])
def top_products(request):
    # Anotamos cuántas unidades de cada producto se han vendido
    productos = (
        Producto.objects
                .annotate(vendidas=Sum('detalle_boletas__cantidad'))
                .order_by('-vendidas')[:3]
    )

    data = []
    for p in productos:
        # Construimos la URL absoluta de la imagen si existe
        imagen_url = None
        if p.imagen and hasattr(p.imagen, 'url'):
            imagen_url = request.build_absolute_uri(p.imagen.url)

        data.append({
            'id':          p.id,
            'nombre':      p.nombre,
            'descripcion': p.descripcion,
            'precio':      float(p.precio),
            'imagen_url':  imagen_url,
            'vendidas':    int(p.vendidas or 0),
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



class ServicioListAPIView(generics.ListAPIView):
    """
    GET /api/servicios/ → lista todos los servicios
    """
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [permissions.AllowAny]


class ServicioDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/servicios/{id}/ → detalle de un servicio
    """
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [permissions.AllowAny]
    
"lo vendido y el general total de ventas"

class ProductoDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/producto/{id}/ → detalle de un producto
    """
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        # Recuperar el producto
        producto = self.get_object()
        
        # Calcular la cantidad vendida sumando las ventas relacionadas
        cantidad_vendida = producto.boletas.aggregate(Sum('cantidad'))['cantidad__sum'] or 0
        
        # Calcular el total generado
        total_generado = cantidad_vendida * producto.precio
        
        # Serializar los datos
        serializer = self.get_serializer(producto)
        data = serializer.data
        
        # Agregar los nuevos campos al resultado
        data['vendidas'] = cantidad_vendida
        data['total_generado'] = total_generado
        
        return Response(data)
"Para la pagina de boleta de venta"
@api_view(['GET'])
def listar_boletas(request):
    boletas = Boleta.objects.all()
    data = BoletaSerializer(boletas, many=True).data
    return Response(data)
class BoletaDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = Boleta.objects.all()
    serializer_class = BoletaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        boleta = self.get_object()
        # Actualizar el estado de la boleta
        boleta.estado = request.data.get('estado', boleta.estado)
        boleta.save()
        return Response({'message': 'Estado de boleta actualizado'})

@api_view(['GET'])
def vendedor_list(request):
    """
    GET /api/vendedores/ → lista todos los vendedores
    """
    vendedores = Vendedor.objects.all()
    serializer = VendedorSerializer(vendedores, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def vendedor_detail(request, pk):
    """
    GET /api/vendedores/{id}/ → detalle de un vendedor
    """
    try:
        vendedor = Vendedor.objects.get(pk=pk)
    except Vendedor.DoesNotExist:
        return Response({'error': 'Vendedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = VendedorSerializer(vendedor)
    return Response(serializer.data)