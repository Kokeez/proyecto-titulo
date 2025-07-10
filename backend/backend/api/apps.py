# api/apps.py
from django.apps import AppConfig
from django.conf import settings
import logging

class ApiConfig(AppConfig):
    name = "api"

    def ready(self):
        if not getattr(settings, "SCHEDULER_ENABLED", False):
            return

        from apscheduler.schedulers.background import BackgroundScheduler
        from .cron import generar_recomendacion_diaria

        log = logging.getLogger(__name__)
        log.info("🔔 Scheduler arrancando…")

        # 1) Ejecutamos ahora mismo al iniciar el programa:
        try:
            generar_recomendacion_diaria()
            log.info("✅ Recomendación diaria generada al inicio.")
        except Exception:
            log.exception("❌ Error generando recomendación al inicio.")

        # 2) Programamos la tarea diaria a las 08:00
        sched = BackgroundScheduler()
        sched.add_job(
            generar_recomendacion_diaria,
            trigger="cron",
            hour=8,
            minute=0,
            id="generar_recomendacion_diaria",
            replace_existing=True,
        )
        sched.start()
        log.info("🕗 Tarea programada: generar_recomendacion_diaria todos los días a las 08:00")



