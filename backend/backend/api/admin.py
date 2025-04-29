from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import Producto
from django.utils.html import format_html

Usuario = get_user_model()

class UsuarioAdmin(UserAdmin):
    model = Usuario

    # Mostrar username, email, first_name y last_name
    list_display = (
        "username", 
        "email", 
        "first_name", 
        "last_name", 
        "is_staff", 
        "is_superuser",
    )
    list_filter = ("is_staff", "is_superuser", "is_active")

    # Añadimos solo photo_url en los fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ("Datos extra", {"fields": ("photo_url",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Datos extra", {"fields": ("photo_url",)}),
    )

# Registra el admin
admin.site.register(Usuario, UsuarioAdmin)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display    = ('id', 'nombre', 'precio', 'cantidad_disponible', 'imagen_preview')
    list_editable   = ('precio', 'cantidad_disponible')
    search_fields   = ('nombre',)
    list_filter     = ('cantidad_disponible',)
    readonly_fields = ('imagen_preview',)

    fieldsets = (
        (None, {
            'fields': ('nombre', 'descripcion', 'imagen')
        }),
        ('Inventario y precio', {
            'fields': ('precio', 'cantidad_disponible')
        }),
        ('Vista previa', {
            'fields': ('imagen_preview',),
        }),
    )

    def imagen_preview(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="max-height: 100px; border-radius:4px;" />',
                obj.imagen.url
            )
        return "Sin imagen"
    imagen_preview.short_description = 'Preview'
