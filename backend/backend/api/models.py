from django.db import models
from django.contrib.auth.models import AbstractUser
class Producto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(null=True, blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_disponible = models.IntegerField()
    fecha_agregado = models.DateTimeField(auto_now_add=True)

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
