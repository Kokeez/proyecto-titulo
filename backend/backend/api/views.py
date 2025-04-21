from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status
from django.contrib.auth.models import User
from datetime import timedelta
from .serializers import LoginSerializer
from django.http import JsonResponse
from django.db.models import Sum
from datetime import datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from .models import Producto, Boleta, DetalleBoleta
from django.contrib.auth import get_user_model

User = get_user_model()



class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Autenticar al usuario
        user = authenticate(username=username, password=password)

        if user is not None:
            # Crear tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            # Establecer la expiración del access_token a 30 minutos
            access_token.set_exp(lifetime=timedelta(minutes=30))  # Establecer la expiración del token

            # Crear la respuesta con la información del usuario
            return Response({
                'refresh': str(refresh),  # El refresh token se convierte a string
                'access': str(access_token),  # El access token se convierte a string
                'user_id': user.id,
                'username': user.username,
                'is_admin': user.is_superuser,  # Verificar si es admin
                'photo_url': user.profile.photo_url if hasattr(user, 'profile') else None,  # Foto de perfil (si tienes un modelo de perfil)
            })
        else:
            return Response({'error': 'Credenciales Invalidas'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def listar_productos(request):
    """
    Devuelve todos los productos con su stock y precio.
    """
    qs = Producto.objects.all().values(
        'id', 'nombre', 'descripcion', 'precio', 'cantidad_disponible'
    )
    return Response(list(qs))


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
def estadisticas_ventas(request):
    """
    Devuelve tres listas:
     - ventas_dias: [ { dia, total }, ... ]
     - ventas_meses: [ { mes, total }, ... ]
     - ventas_anios: [ { anio, total }, ... ]
    """
    ventas_dias = (
        DetalleBoleta.objects
          .annotate(dia=TruncDay('boleta__fecha'))
          .values('dia')
          .annotate(total=Sum('subtotal'))
          .order_by('dia')
    )

    ventas_meses = (
        DetalleBoleta.objects
          .annotate(mes=TruncMonth('boleta__fecha'))
          .values('mes')
          .annotate(total=Sum('subtotal'))
          .order_by('mes')
    )

    ventas_anios = (
        DetalleBoleta.objects
          .annotate(anio=TruncYear('boleta__fecha'))
          .values('anio')
          .annotate(total=Sum('subtotal'))
          .order_by('anio')
    )

    return Response({
        'ventas_dias': list(ventas_dias),
        'ventas_meses': list(ventas_meses),
        'ventas_anios': list(ventas_anios),
    })

