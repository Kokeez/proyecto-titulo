from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Producto, Vendedor, Vehiculo, Servicio, Boleta, DetalleBoleta, Recommendation


User = get_user_model()
"USUARIO SERIALIZER"
class UsuarioRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'nickname', 'password', 'email', 'nombre', 'rol']

    def create(self, validated_data):
        return User.objects.create_user(
            nickname=validated_data['nickname'],
            password=validated_data['password'],
            email=validated_data.get('email'),
            nombre=validated_data.get('nombre', ''),
            rol=validated_data.get('rol', 'Empleado')
        )

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nickname', 'email', 'nombre', 'rol', 'fecha_registro', 'activo', 'is_staff']

class LoginSerializer(serializers.Serializer):
    nickname = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        nickname = attrs.get('nickname')
        password = attrs.get('password')
        user = authenticate(request=self.context.get('request'), nickname=nickname, password=password)
        if not user:
            raise serializers.ValidationError('Credenciales incorrectas')
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        return {
            'refresh': str(refresh),
            'access': str(access),
            'user': UsuarioSerializer(user).data
        }
"VEHICULO SERIALIZER"
class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        # excluimos kilometraje, dejamos id, marca, modelo y año
        fields = ['id', 'marca', 'modelo', 'ano']
"PRODUCTO SERIALIZER"
class ProductoSerializer(serializers.ModelSerializer):
    # Campo para subir la imagen
    imagen = serializers.ImageField(
        write_only=True,      # se usa sólo al crear/editar
        required=False,       # opcional
        allow_null=True
    )
    imagen_url = serializers.SerializerMethodField()
    vendidas = serializers.IntegerField(read_only=True)
    total_generado = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )

    vehiculo_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehiculo.objects.all(),
        source='vehiculo',
        allow_null=True,
        required=False
    )
    vehiculo = VehiculoSerializer(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion', 'precio', 'cantidad_disponible',
            'imagen',           # <- lo añadimos aquí
            'imagen_url',
            'tipo', 'es_alternativo',
            'vehiculo_id', 'vehiculo',
            'vendidas', 'total_generado'
        ]

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None

    def create(self, validated_data):
        # extraigo la imagen si llega
        imagen = validated_data.pop('imagen', None)
        vehiculo = validated_data.get('vehiculo', None)
        if vehiculo:
            validated_data['marca'] = vehiculo.marca

        producto = super().create(validated_data)
        if imagen:
            producto.imagen = imagen
            producto.save(update_fields=['imagen'])
        return producto

    def update(self, instance, validated_data):
        # permitimos partial update
        imagen = validated_data.pop('imagen', None)
        vehiculo = validated_data.get('vehiculo', instance.vehiculo)
        if vehiculo:
            validated_data['marca'] = vehiculo.marca

        producto = super().update(instance, validated_data)
        if imagen:
            producto.imagen = imagen
            producto.save(update_fields=['imagen'])
        return producto


"VENDEDOR SERIALIZER"
class VendedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendedor
        fields = ['id', 'nombre', 'email', 'direccion', 'fecha_ingreso']

class VehiculoSerializer(serializers.ModelSerializer):
    # mostramos datos anidados del propietario
    propietario = serializers.StringRelatedField(read_only=True)
    # para asignar un propietario por ID
    propietario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='propietario',
        write_only=True
    )

    class Meta:
        model = Vehiculo
        fields = [
            'id',
            'marca',
            'modelo',
            'ano',
            'kilometraje',
            'propietario',
            'propietario_id'
        ]
"SERVICIO SERIALIZER"
class ServicioSerializer(serializers.ModelSerializer):
    # Convertimos el precio_base a un número flotante antes de enviarlo
    precio_base = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion', 'precio_base', 'duracion_estimada']
    
    def to_representation(self, instance):
        # Aquí convertimos precio_base a float si es necesario
        representation = super().to_representation(instance)
        # Aseguramos que el precio sea un número
        representation['precio_base'] = float(representation['precio_base'])
        return representation
    
"VENTAS SERIALIZERS"

class DetalleBoletaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True)

    class Meta:
        model  = DetalleBoleta
        fields = ['id', 'producto_nombre', 'servicio_nombre',
                  'cantidad', 'precio_unitario', 'subtotal']

class BoletaSerializer(serializers.ModelSerializer):
    vendedor = VendedorSerializer(read_only=True)
    detalles = DetalleBoletaSerializer(many=True, read_only=True)  # quitamos `source`

    class Meta:
        model = Boleta
        fields = ['id', 'fecha_venta', 'total', 'estado', 'tipo', 'vendedor', 'detalles']

        
class BoletaDetailSerializer(serializers.ModelSerializer):
    vendedor = VendedorSerializer(read_only=True)
    detalles = DetalleBoletaSerializer(many=True, read_only=True)  # sin source redundante

    class Meta:
        model  = Boleta
        fields = ['id', 'fecha_venta', 'total', 'estado', 'tipo', 'vendedor', 'detalles']


class LineItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)
    service_id = serializers.IntegerField(required=False)
    quantity   = serializers.IntegerField(min_value=1)

    def validate(self, data):
        # Al menos uno de los dos campos debe venir
        if not data.get('product_id') and not data.get('service_id'):
            raise serializers.ValidationError(
                "Debe especificar product_id o service_id en cada línea."
            )
        return data

    def validate_product_id(self, value):
        try:
            Producto.objects.get(id=value)
        except Producto.DoesNotExist:
            raise serializers.ValidationError("El producto no existe.")
        return value

    def validate_service_id(self, value):
        try:
            Servicio.objects.get(id=value)
        except Servicio.DoesNotExist:
            raise serializers.ValidationError("El servicio no existe.")
        return value



class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Recommendation
        fields = ['fecha', 'contenido']