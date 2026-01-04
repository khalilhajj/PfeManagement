from celery import shared_task
from django.utils import timezone
from .models import Soutenance

@shared_task
def check_soutenance_status():
    """
    Periodic task to check for planned soutenances that have passed.
    Marks them as 'Done'.
    """
    now = timezone.now()
    today = now.date()
    
    # Update Planned soutenances where date < today
    # OR date == today and time < now.time()
    
    # Simple approach: If date is in the past, mark as Done.
    # For today, we might wait until tomorrow or check time.
    # Let's say if date < today, it is definitely done.
    
    updated_count = Soutenance.objects.filter(
        status='Planned',
        date__lt=today
    ).update(status='Done')
    
    return f"Updated {updated_count} past soutenances to Done."
