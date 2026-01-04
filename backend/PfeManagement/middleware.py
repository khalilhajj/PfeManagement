from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.db import close_old_connections

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        if not token_key or token_key == 'null' or token_key == 'undefined':
            return AnonymousUser()
            
        token = AccessToken(token_key)
        user_id = token['user_id']
        user = User.objects.get(id=user_id)
        return user
    except Exception:
        return AnonymousUser()

class JwtAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        close_old_connections()
        try:
            # Parse query string for token
            query_string = scope['query_string'].decode()
            query_params = dict(qs.split('=') for qs in query_string.split('&') if '=' in qs)
            token = query_params.get('token')
            
            if token:
                scope['user'] = await get_user(token)
            else:
                scope['user'] = AnonymousUser()
        except Exception:
            scope['user'] = AnonymousUser()
            
        return await self.app(scope, receive, send)
