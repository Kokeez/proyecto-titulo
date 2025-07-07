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
                trigger="cron",    # <-- cambio aquí
                hour=8,
                minute=0,
                id="generar_recomendacion_diaria",
                replace_existing=True,
            )
            sched.start()
            log.info("Job ‘generar_recomendacion_diaria’ programada todos los días a las 08:00")


