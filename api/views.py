from datetime import datetime, timedelta

from django.db.models import Q
from django.shortcuts import render

# Create your views here.
import requests
from django.conf import settings
from requests.auth import HTTPBasicAuth
from rest_framework import status, renderers
from rest_framework.parsers import FileUploadParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import is_server_error
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from api.users.models import User


class ImageUploadParser(FileUploadParser):
    media_type = 'image/*'


class BaseAPIView(APIView):
    """
    Base class for API views.
    """
    authentication_classes = ()
    permission_classes = (IsAuthenticated,)
    renderer_classes = [ renderers.JSONRenderer]

    def send_response(
            self,
            success=False,
            code='',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            payload={},
            description='',
            exception=None,
            count=0,
            log_description=""
    ):
        """
        Generates response.
        :param success: bool tells if call is successful or not.
        :param code: str status code.
        :param status_code: int HTTP status code.
        :param payload: list data generated for respective API call.
        :param description: str description.
        :param exception: str description.
        :rtype: dict.
        """
        if not success and is_server_error(status_code):
            if settings.DEBUG:
                description = f'error message: {description}'
            else:
                description = 'Internal server error.'
        return Response(
            data={
                'success': success,
                'code': code,
                'payload': payload,
                'description': description,
                'exception': exception,
                'count': count,
            },
            status=status_code
        )

    def send_data_response(
            self,
            success=False,
            code='',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            payload={},
            description=''):
        """
        Generates response for data tables.
        :param success: bool tells if call is successful or not.
        :param code: str status code.
        :param status_code: int HTTP status code.
        :param payload: list data generated for respective API call.
        :param description: str description.
        :rtype: dict.
        """
        if not success and is_server_error(status_code):
            if settings.DEBUG:
                description = f'error message: {description}'
            else:
                description = 'Internal server error.'
        return Response(
            data={
                'data': {
                    'success': success,
                    'code': code,
                    'payload': payload,
                    'description': description}
            },
            status=status_code
        )

    @staticmethod
    def get_oauth_token(email='', password='', grant_type='password'):
        try:
            url = settings.AUTHORIZATION_SERVER_URL
            # url ='http://192.168.100.10:8000/api/oauth/token/'
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            data = {
                'username': email.lower(),
                'password': password,
                'grant_type': grant_type
            }
            auth = HTTPBasicAuth(
                settings.OAUTH_CLIENT_ID,
                settings.OAUTH_CLIENT_SECRET
            )
            response = requests.post(
                url=url,
                headers=headers,
                data=data,
                auth=auth
            )
            if response.ok:
                json_response = response.json()
                return {
                    'access_token': json_response.get('access_token', ''),
                    'refresh_token': json_response.get('refresh_token', '')
                }
            else:
                return {'error': response.json().get('error')}
        except Exception as e:
            return {'exception': str(e)}

    @staticmethod
    def revoke_oauth_token(token):
        try:
            url = settings.REVOKE_TOKEN_URL
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            data = {
                'token': token,
                'client_secret': settings.OAUTH_CLIENT_SECRET,
                'client_id': settings.OAUTH_CLIENT_ID
            }
            response = requests.post(
                url=url,
                headers=headers,
                data=data
            )
            if response.ok:
                return True
            else:
                return False
        except Exception:
            return False

    @staticmethod
    def convert_oauth_token(token=None, backend=None, grant_type='password', request=None):
        try:
            # AccessToken.objects.get_or_create()
            google_id = None
            facebook_id = None
            if backend == 'facebook':
                response = requests.post(
                    url=settings.FACEBOOK_GRAPH_URL + f'me?fields=id&access_token={token}',
                    headers=header,
                )
                if response.ok:
                    facebook_id = response.json()["id"]
                else:
                    return {"error": response.json()["error"]["message"]}
            else:
                response = requests.get(
                    url=settings.GOOGLE_BASE_URL + "?personFields=names,genders,emailAddresses,phoneNumbers",
                    headers=header,
                )
                if response.ok:
                    google_id = response.json()["resourceName"].split('people/')[1]
                else:
                    return {"error": response.json()["error"]["message"]}

            if facebook_id:
                query = Q(facebook_id=facebook_id)
            else:
                query = Q(google_id=google_id)
            user = User.objects.get(query)
            token = Token.objects.create(user=user)

            return {
                'access_token': token.pk,
                "user": user
            }
        except User.DoesNotExist:
            return {
                "error": "Sign up required",
                "sign_up_required": True
            }
        except Exception as e:
            raise e
