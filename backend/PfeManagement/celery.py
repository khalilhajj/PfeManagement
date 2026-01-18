import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PfeManagement.settings')

app = Celery('PfeManagement')

# Load config from Django settings with the CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'deactivate-inactive-users-daily': {
        'task': 'authentication.tasks.deactivate_inactive_users',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2:00 AM
    },
    'scrape-internship-opportunities': {
        'task': 'internship.tasks.scrape_internship_opportunities',
        'schedule': crontab(hour=3, minute=0),  # Run daily at 3:00 AM
    },
    'check-soutenance-status': {
        'task': 'internship.tasks.check_soutenance_status',
        'schedule': crontab(hour=1, minute=0),  # Run daily at 1:00 AM
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
