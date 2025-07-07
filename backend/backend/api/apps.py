# api/apps.py
from django.apps import AppConfig
from django.conf import settings
import logging

class ApiConfig(AppConfig):
    name = "api"

    def ready(self):
        if getattr(settings, "SCHEDULER_ENABLED", False):
            from apscheduler.schedulers.background import BackgroundScheduler
            from .cron import generar_recomendacion_diaria

            log = logging.getLogger(__name__)
            log.info("🔔 Scheduler arrancando…")

            sched = BackgroundScheduler()
            sched.add_job(
                generar_recomendacion_diaria,
                trigger="interval",  # cambiar luego a "cron"
                minutes=1,           # luego: hour=1, minute=0
                id="reco_prueba",
                replace_existing=True,
            )
            sched.start()
            log.info("✅ Job ‘reco_prueba’ programada cada minuto para pruebas")

