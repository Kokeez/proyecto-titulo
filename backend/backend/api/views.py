# ==== Librerías estándar ====
import datetime
from datetime import date, timedelta

# ==== Django ====
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum, Value, IntegerField, DecimalField, Count, F
from django.db.models.functions import Coalesce, TruncDay, TruncMonth, TruncYear
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import User

# ==== DRF & terceros ====
from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum, Q, Value, IntegerField, DecimalField
from django.db.models.functions import Coalesce

# ==== Modelos locales ====
from .models import (
    Producto,
    Boleta,
    DetalleBoleta,
    Servicio,
    Vendedor,
    Vehiculo,
    Recommendation
)

# ==== Serializadores locales ====
from .serializers import (
    UsuarioSerializer,
    UsuarioRegistrationSerializer,
    VendedorSerializer,
    VehiculoSerializer,
    ProductoSerializer,
    LoginSerializer,
    ServicioSerializer,
    BoletaSerializer,
    LineItemSerializer,
    BoletaDetailSerializer,
    RecommendationSerializer
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
    producto = get_object_or_404(Producto, pk=producto_id)

    # Agregados con output_field para evitar el mixed types error
    ventas = producto.detalle_boletas.aggregate(
        vendidas=Coalesce(
            Sum('cantidad'),
            Value(0),
            output_field=IntegerField()
        ),
        total_generado=Coalesce(
            Sum('subtotal'),
            Value(0),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
    )

    imagen_url = (
        request.build_absolute_uri(producto.imagen.url)
        if producto.imagen else
        None
    )

    data = {
        'id': producto.id,
        'nombre': producto.nombre,
        'descripcion': producto.descripcion,
        'precio': float(producto.precio),
        'cantidad_disponible': producto.cantidad_disponible,
        'imagen_url': imagen_url,
        'vendidas': ventas['vendidas'],
        'total_generado': float(ventas['total_generado']),
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def estadisticas_ventas(request):
    """
    GET /api/estadisticas-ventas/
    Devuelve métricas:
      - ventas_dias: por día (últimos N días)
      - ventas_meses: por mes (año corriente)
      - ventas_anual: por año (todos los años)
      - ventas_tipo: por tipo de boleta (Venta vs Servicio)
      - ventas_vendedor: por vendedor
    Cada registro incluye: total (CLP), unidades vendidas, número de boletas, ticket promedio.
    """
    # Diarias
    ventas_dias = (
        DetalleBoleta.objects
          .annotate(dia=TruncDay('boleta__fecha_venta'))
          .values('dia')
          .annotate(
            total=Sum('subtotal'),
            unidades=Sum('cantidad'),
            boletas=Count('boleta', distinct=True),
          )
          .order_by('dia')
    )

    # Mensuales (año actual)
    ventas_meses = (
        DetalleBoleta.objects
          .filter(boleta__fecha_venta__year=F('boleta__fecha_venta__year'))  # opcional limitar al año actual
          .annotate(mes=TruncMonth('boleta__fecha_venta'))
          .values('mes')
          .annotate(
            total=Sum('subtotal'),
            unidades=Sum('cantidad'),
            boletas=Count('boleta', distinct=True),
          )
          .order_by('mes')
    )

    # Anuales
    ventas_anual = (
        DetalleBoleta.objects
          .annotate(anio=TruncYear('boleta__fecha_venta'))
          .values('anio')
          .annotate(
            total=Sum('subtotal'),
            unidades=Sum('cantidad'),
            boletas=Count('boleta', distinct=True),
          )
          .order_by('anio')
    )

    # Por tipo de boleta
    ventas_tipo = (
        DetalleBoleta.objects
          .values('boleta__tipo')
          .annotate(
            total=Sum('subtotal'),
            unidades=Sum('cantidad'),
            boletas=Count('boleta', distinct=True),
          )
    )

    # Por vendedor
    ventas_vendedor = (
        DetalleBoleta.objects
          .values('boleta__vendedor__nombre')
          .annotate(
            total=Sum('subtotal'),
            unidades=Sum('cantidad'),
            boletas=Count('boleta', distinct=True),
          )
    )

    # Construir ticket promedio sobre la marcha en el frontend o aquí:
    # ticket = total / boletas si boletas>0
    return Response({
        'ventas_dias':       list(ventas_dias),
        'ventas_meses':      list(ventas_meses),
        'ventas_anual':      list(ventas_anual),
        'ventas_tipo':       list(ventas_tipo),
        'ventas_vendedor':   list(ventas_vendedor),
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
    # 1) Validar líneas
    serializer = LineItemSerializer(
        data=request.data.get('items', []),
        many=True
    )
    serializer.is_valid(raise_exception=True)
    items = serializer.validated_data

    # 2) Validar vendedor
    vendedor_id = request.data.get('vendedor_id')
    if not vendedor_id:
        return Response({"error": "Vendedor no proporcionado"}, status=400)
    try:
        vendedor = Vendedor.objects.get(id=vendedor_id)
    except Vendedor.DoesNotExist:
        return Response({"error": "Vendedor no encontrado"}, status=404)

    # 3) Crear boleta
    boleta = Boleta.objects.create(
        usuario=request.user,
        vendedor=vendedor,
        total=0
    )

    # 4) Iterar líneas y crear detalle según sea producto o servicio
    total = 0
    for line in items:
        qty = line['quantity']

        if 'product_id' in line:
            prod = Producto.objects.get(pk=line['product_id'])
            price = prod.precio
            subtotal = price * qty

            # Crea el detalle de producto
            DetalleBoleta.objects.create(
                boleta=boleta,
                producto=prod,
                cantidad=qty,
                precio_unitario=price,
                subtotal=subtotal
            )

            # Ajusta stock
            prod.cantidad_disponible = max(0, prod.cantidad_disponible - qty)
            prod.save()

        else:  # viene service_id
            serv = Servicio.objects.get(pk=line['service_id'])
            price = serv.precio_base
            subtotal = price * qty

            # Crea el detalle de servicio
            DetalleBoleta.objects.create(
                boleta=boleta,
                servicio=serv,
                cantidad=qty,
                precio_unitario=price,
                subtotal=subtotal
            )

        total += subtotal

    # 5) Guardar total en la boleta y devolver respuesta
    boleta.total = total
    boleta.save()

    return Response({
        'boleta_id': boleta.id,
        'fecha_venta': boleta.fecha_venta,
        'total': float(total),
    })



from django.db.models import Sum, Q, Value, IntegerField
from django.db.models.functions import Coalesce

@api_view(['GET'])
def top_products(request):
    # 1) Anotamos solo líneas de boletas pagadas
    qs = Producto.objects.annotate(
        vendidas=Coalesce(
            Sum(
                'detalle_boletas__cantidad',
                filter=Q(detalle_boletas__boleta__estado='Pagada')
            ),
            Value(0),
            output_field=IntegerField()
        )
    )
    # 2) Ordenamos de más vendidas a menos y luego tomamos 3
    top3 = qs.order_by('-vendidas')[:3]

    data = []
    for p in top3:
        imagen_url = (
            request.build_absolute_uri(p.imagen.url)
            if p.imagen and hasattr(p.imagen, 'url') else None
        )
        data.append({
            'id':          p.id,
            'nombre':      p.nombre,
            'descripcion': p.descripcion,
            'precio':      float(p.precio),
            'imagen_url':  imagen_url,
            'vendidas':    int(p.vendidas),
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
        partial = kwargs.pop('partial', True)
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


class BoletaDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = Boleta.objects.all()
    serializer_class = BoletaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        boleta = self.get_object()
        boleta.estado = request.data.get('estado', boleta.estado)
        boleta.save()
        return Response({'message': 'Estado de boleta actualizado'})

class VehiculoListAPIView(generics.ListAPIView):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]


" API RECOMENDACION DE DASHBOARD "
class TodayRecommendationAPIView(generics.RetrieveAPIView):
    """
    GET /api/recomendacion/ → devuelve la recomendación del día o 404 si no existe.
    """
    queryset           = Recommendation.objects.all()
    serializer_class   = RecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # date.today() viene del módulo, no de la clase datetime.datetime
        hoy = datetime.date.today()
        return generics.get_object_or_404(self.get_queryset(), fecha=hoy)