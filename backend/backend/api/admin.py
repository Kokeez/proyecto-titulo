from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

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

