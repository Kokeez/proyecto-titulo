from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import LoginView, ProductoViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')

urlpatterns = [
    # auth
    path('login/', LoginView.as_view(), name='login'),
    # boletas
    path('boletas/',          views.listar_boletas,    name='listar_boletas'),
    path('boleta/<int:boleta_id>/', views.detalle_boleta, name='detalle_boleta'),
    # estadísticas
    path('estadisticas-ventas/', views.estadisticas_ventas, name='estadisticas_ventas'),
    # endpoints manuales de producto
    path('producto/<int:producto_id>/', views.detalle_producto, name='detalle_producto'),
    path('productos/search/',              views.buscar_productos_live, name='buscar_productos'),
    path('productos/top/',                 views.top_products,          name='top_products'),
    path('checkout/',                      views.checkout,              name='checkout'),
    # finalmente, montamos todas las rutas REST del ViewSet:
    path('', include(router.urls)),
]
