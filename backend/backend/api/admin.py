from django.contrib.auth import get_user_model
from .models import Producto
from django.utils.html import format_html

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    model = Usuario

    # Qué columnas mostrar en la lista
    list_display = (
        'nickname',
        'email',
        'rol',
        'activo',
        'is_staff',
    )

    # Filtros laterales
    list_filter = (
        'rol',
        'activo',
        'is_staff',
    )

    # Campos por los que buscar
    search_fields = ('nickname', 'email', 'nombre')

    # Orden por defecto
    ordering = ('nickname',)

    # Campos que aparecen en la vista de detalle
    fieldsets = (
        (None,               {'fields': ('nickname', 'password')}),
        ('Información',      {'fields': ('nombre', 'email', 'rol', 'activo')}),
        ('Permisos',         {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas',           {'fields': ('last_login', 'fecha_registro')}),
    )

    # Campos para el formulario de creación de usuarios
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('nickname', 'email', 'nombre', 'rol', 'password1', 'password2', 'activo', 'is_staff'),
        }),
    )