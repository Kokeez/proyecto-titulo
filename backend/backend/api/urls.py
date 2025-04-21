from django.urls import path
from .views import LoginView
from . import views

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('productos/', views.listar_productos),
    path('boletas/', views.listar_boletas),
    path('boleta/<int:boleta_id>/', views.detalle_boleta),
    path('estadisticas_ventas/', views.estadisticas_ventas),
]
