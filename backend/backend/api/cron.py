import os
import logging
from django.db.models import Sum, Avg, Q, F
from django.utils import timezone
from openai import OpenAI
from .models import Recommendation, DetalleBoleta, Producto

logger = logging.getLogger(__name__)

def generar_recomendacion_diaria():
    """
    Tarea que corre una vez al día (por ejemplo a la 1am).
    Calcula métricas clave y genera una recomendación con OpenAI.
    """
    # 0) Fecha
    fecha_hoy = timezone.localdate()
    # Evitar duplicados
    if Recommendation.objects.filter(fecha=fecha_hoy).exists():
        logger.info(f"[{fecha_hoy}] Ya existe recomendación, no se repite.")
        return

    # 1) Ventas día anterior
    ayer = fecha_hoy - timezone.timedelta(days=1)
    ventas_ayer = DetalleBoleta.objects \
        .filter(boleta__fecha_venta__date=ayer) \
        .aggregate(total=Sum('subtotal'))['total'] or 0

    # 2) Top 3 productos más vendidos ayer
    top3 = (
        DetalleBoleta.objects
        .filter(boleta__fecha_venta__date=ayer, producto__isnull=False)
        .values('producto__nombre')
        .annotate(unidades=Sum('cantidad'))
        .order_by('-unidades')[:3]
    )
    top_data = [{
        'nombre': item['producto__nombre'],
        'unidades': item['unidades']
    } for item in top3]
    # Rellenar con placeholders si faltan
    while len(top_data) < 3:
        top_data.append({'nombre': '—', 'unidades': 0})

    # 3) Slow movers últimos 7 días
    semana_atras = fecha_hoy - timezone.timedelta(days=7)
    slow = (
        Producto.objects
        .annotate(vendidas=Sum(
            'detalle_boletas__cantidad',
            filter=Q(detalle_boletas__boleta__fecha_venta__date__gte=semana_atras)
        ))
        .filter(vendidas__lt=2)
        .order_by('vendidas')[:3]
    )
    slow_list = [p.nombre for p in slow] or ['ninguno']

    # 4) Ventas hoy (hasta ahora) y promedio diario de la semana pasada
    hoy = timezone.now().date()
    venta_hoy = DetalleBoleta.objects \
        .filter(boleta__fecha_venta__date=hoy) \
        .aggregate(total=Sum('subtotal'))['total'] or 0

    promedio_semanal = DetalleBoleta.objects \
        .filter(
            boleta__fecha_venta__date__gte=semana_atras,
            boleta__fecha_venta__date__lt=hoy
        ) \
        .aggregate(prom=Avg('subtotal'))['prom'] or 0

    # 5) % cambio vs mismo día semana pasada
    mismo_dia_semana_pasada = hoy - timezone.timedelta(days=7)
    venta_semana_pasada = DetalleBoleta.objects \
        .filter(boleta__fecha_venta__date=mismo_dia_semana_pasada) \
        .aggregate(total=Sum('subtotal'))['total'] or 0
    pct_cambio = (
        (venta_hoy - venta_semana_pasada) / venta_semana_pasada * 100
        if venta_semana_pasada > 0 else 0
    )

    # 6) Stock crítico (<3 unidades)
    stock_critico = Producto.objects.filter(cantidad_disponible__lt=3)
    stock_critico_list = [p.nombre for p in stock_critico] or ['ninguno']

    # 7) Construir prompt
    prompt = f"""
Eres un asistente analítico para un taller de autos. Toma estos datos para generar un breve informe:

• Fecha de análisis: {fecha_hoy}  
• Ventas totales del día anterior: ${ventas_ayer:.0f} CLP  
• Top 3 productos más vendidos ayer (con unidades vendidas):  
  1. {top_data[0]['nombre']} – {top_data[0]['unidades']} uds  
  2. {top_data[1]['nombre']} – {top_data[1]['unidades']} uds  
  3. {top_data[2]['nombre']} – {top_data[2]['unidades']} uds  
• Top 3 productos slow‐moving en últimos 7 días: {', '.join(slow_list)}  
• Ventas hoy vs promedio diario última semana: ${venta_hoy:.0f} vs ${promedio_semanal:.0f}  
• Cambio % vs mismo día semana pasada: {pct_cambio:.1f}%  
• Stock crítico (menos de 3 unidades): {', '.join(stock_critico_list)}

Con base en esto:
1. Haz un resumen de 2–3 líneas sobre el desempeño general (tendencias, puntos fuertes y débiles).  
2. Propón 3 recomendaciones concretas (una por línea) para mejorar ventas o rotación de stock.  
Mantén tono claro y orientado a la acción.
""".strip()

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}],
        temperature=0.7,
    )
    texto = resp.choices[0].message.content.strip()

    Recommendation.objects.create(fecha=fecha_hoy, contenido=texto)
    logger.info(f"[{timezone.now()}] 📝 Recommendation creada para {fecha_hoy}")
