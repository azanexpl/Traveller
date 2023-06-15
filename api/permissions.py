from django.conf import settings
from django.contrib.auth import authenticate
from google.oauth2 import id_token
from oauth2_provider.models import AccessToken
from rest_framework import permissions
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import NotAuthenticated
from rest_framework.response import Response
from rest_framework.views import exception_handler
from google.auth.transport import requests as google_requests

import rest_framework.authentication

from api.users.models import User


# Custom Permission Based on TokenID
class GETIsOauthAuthenticated(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method == "GET":
            return True
        try:
            # Fetch the Token Id from user cookie
            token_id = request.COOKIES.get('u-at', None)
            if token_id:
                # Verify the Token if Valid or not
                id_info = id_token.verify_oauth2_token(
                    token_id, google_requests.Request(), settings.GOOGLE_CLIENT_ID
                )
                if id_info['iss'] == 'accounts.google.com' and id_info['aud'] == settings.GOOGLE_CLIENT_ID:
                    # Token ID is valid fetch the user details
                    request.user = User.objects.get(token_id=token_id)
                    return True
            else:
                return False
        except ValueError:
            # If token is not valid return a permission error so that user can Logged in again
            return False


def custom_exception_handler(exc, context):
    if isinstance(exc, NotAuthenticated):
        return Response({"description": "Authentication credentials were not provided."},
                        status=401)
    return exception_handler(exc, context)
