from django.db import models
from django.contrib.auth.models import AbstractUser
class Producto(models.Model):
    nombre              = models.CharField(max_length=200)
    descripcion         = models.TextField(blank=True, default="")
    precio              = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_disponible = models.PositiveIntegerField(default=0)
    # Nuevo campo:
    imagen              = models.ImageField(
                              upload_to='productos/',  # carpeta dentro de MEDIA_ROOT
                              blank=True,
                              null=True
                          )

    def __str__(self):
        return self.nombre

class Boleta(models.Model):
    usuario = models.ForeignKey('Usuario', on_delete=models.SET_NULL, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)

class DetalleBoleta(models.Model):
    boleta = models.ForeignKey(Boleta, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

class Usuario(AbstractUser):
    # Ya heredas estos campos de AbstractUser:
    #   username, first_name, last_name, email, password,
    #   is_staff, is_active, is_superuser, last_login, date_joined, etc.

    photo_url = models.URLField("URL de foto de perfil", blank=True, null=True)

    email = models.EmailField("Correo electrónico", unique=True)

    def __str__(self):
        return self.username
