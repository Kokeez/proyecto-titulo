from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
class UsuarioManager(BaseUserManager):
    def create_user(self, nickname, password=None, email=None, nombre=None, rol='Empleado', **extra_fields):
        if not nickname:
            raise ValueError('El usuario debe tener un nickname válido')
        # email es opcional ahora:
        email = self.normalize_email(email) if email else None
        user = self.model(
            nickname=nickname,
            email=email,
            nombre=nombre or '',
            rol=rol,
            **extra_fields
        )
        user.set_password(password)   # aquí Django hashea la contraseña
        user.save(using=self._db)
        return user

    def create_superuser(self, nickname, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(nickname, password, rol='Administrador', **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    ROLES = [
        ('Administrador', 'Administrador'),
        ('Vendedor',     'Vendedor'),
        ('Empleado',     'Empleado'),
    ]

    nickname        = models.CharField('Nickname', max_length=30, unique=True)
    email           = models.EmailField('Correo electrónico', blank=True, null=True)
    nombre          = models.CharField('Nombre completo', max_length=150, blank=True)
    rol             = models.CharField('Rol', max_length=20, choices=ROLES, default='Empleado')
    fecha_registro  = models.DateTimeField(auto_now_add=True)
    activo          = models.BooleanField(default=True)

    is_staff        = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD  = 'nickname'
    REQUIRED_FIELDS = []  # si quieres que se pida email/nombre al crear superusuario, añádelos aquí

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.nickname


class Vendedor(models.Model):
    nombre = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    direccion = models.CharField(max_length=250, blank=True)
    fecha_ingreso = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = 'Vendedor'
        verbose_name_plural = 'Vendedores'

    def __str__(self):
        return self.nombre


class Vehiculo(models.Model):
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100, blank=True)
    ano = models.PositiveIntegerField()
    kilometraje = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.ano})"


class Producto(models.Model):
    TIPOS = [
        ('Neumático', 'Neumático'),
        ('Cámara', 'Cámara'),
        ('Líquido', 'Líquido'),
        ('Accesorio', 'Accesorio'),
    ]

    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_disponible = models.PositiveIntegerField(default=0)
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    tipo = models.CharField(max_length=50, choices=TIPOS)
    marca = models.CharField(max_length=100, blank=True)
    es_alternativo = models.BooleanField('Alternativo', default=False)
    fecha_agregado = models.DateTimeField(auto_now_add=True)
    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='productos'
    )

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def __str__(self):
        return self.nombre


class Servicio(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    duracion_estimada = models.DurationField(null=True, blank=True)

    class Meta:
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'

    def __str__(self):
        return self.nombre


class Boleta(models.Model):
    ESTADOS = [
        ('Pagada', 'Pagada'),
        ('Pendiente', 'Pendiente'),
        ('Anulada', 'Anulada'),
    ]
    TIPOS = [
        ('Venta', 'Venta'),
        ('Servicio', 'Servicio'),
    ]

    usuario = models.ForeignKey(
        'Usuario',
        on_delete=models.CASCADE,
        related_name='boletas'
    )
    vendedor = models.ForeignKey(
        Vendedor,
        on_delete=models.CASCADE,
        related_name='boletas'
    )
    fecha_venta = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Pendiente')
    tipo = models.CharField(max_length=20, choices=TIPOS, default='Venta')

    class Meta:
        verbose_name = 'Boleta'
        verbose_name_plural = 'Boletas'

    def __str__(self):
        return f"Boleta #{self.id} - {self.usuario.email}"


class DetalleBoleta(models.Model):
    boleta = models.ForeignKey(
        Boleta,
        on_delete=models.CASCADE,
        related_name='detalles'
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='detalle_boletas'
    )
    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='detalle_boletas'
    )
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'Detalle de Boleta'
        verbose_name_plural = 'Detalles de Boleta'

    def __str__(self):
        item = self.producto or self.servicio
        return f"{item} x{self.cantidad}"


class Proveedor(models.Model):
    nombre = models.CharField(max_length=200)
    contacto = models.CharField(max_length=200, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    direccion = models.CharField(max_length=250, blank=True)
    productos_asociados = models.ManyToManyField(
        Producto,
        blank=True,
        related_name='proveedores'
    )

    class Meta:
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'

    def __str__(self):
        return self.nombre


class HistorialInventario(models.Model):
    MOVIMIENTOS = [
        ('Compra', 'Compra'),
        ('Venta', 'Venta'),
        ('Ajuste', 'Ajuste'),
    ]

    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='historiales'
    )
    cantidad = models.IntegerField()
    tipo_movimiento = models.CharField(max_length=20, choices=MOVIMIENTOS)
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(
        'Usuario',
        on_delete=models.SET_NULL,
        null=True,
        related_name='movimientos_inventario'
    )

    class Meta:
        verbose_name = 'Historial de Inventario'
        verbose_name_plural = 'Historiales de Inventario'

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.producto.nombre} ({self.cantidad})"


class Pago(models.Model):
    ESTADOS_PAGO = [
        ('Completado', 'Completado'),
        ('Pendiente', 'Pendiente'),
    ]
    METODOS = [
        ('Efectivo', 'Efectivo'),
        ('Tarjeta', 'Tarjeta'),
        ('Transferencia', 'Transferencia'),
    ]

    boleta = models.ForeignKey(
        Boleta,
        on_delete=models.CASCADE,
        related_name='pagos'
    )
    fecha_pago = models.DateTimeField(auto_now_add=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=METODOS)
    estado = models.CharField(max_length=20, choices=ESTADOS_PAGO, default='Pendiente')

    class Meta:
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'

    def __str__(self):
        return f"Pago #{self.id} - {self.boleta} : {self.monto}"
