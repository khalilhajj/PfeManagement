from celery import shared_task
from django.utils import timezone
from django.db import models
from datetime import timedelta
from .models import User
import logging

logger = logging.getLogger(__name__)

@shared_task
def deactivate_inactive_users():
    six_months_ago = timezone.now() - timedelta(days=180)
    inactive_users = User.objects.filter(
        is_enabled=True,
        is_active=True
    ).filter(
        models.Q(last_login_time__lt=six_months_ago) | models.Q(last_login_time__isnull=True)
    )
    import pdb; pdb.set_trace()
    inactive_users = inactive_users.filter(
        date_joined__lt=six_months_ago
    )
    
    deactivated_count = 0
    for user in inactive_users:
        user.is_enabled = False
        user.save(update_fields=['is_enabled'])
        deactivated_count += 1
        logger.info(f"Deactivated user {user.username} (last login: {user.last_login_time})")
    
    logger.info(f"Deactivated {deactivated_count} inactive users")
    return {
        'deactivated_count': deactivated_count,
        'cutoff_date': six_months_ago.isoformat()
    }
