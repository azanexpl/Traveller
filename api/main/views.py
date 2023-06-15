import json
import os

import requests
from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponseBadRequest
from django.shortcuts import redirect
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

# Create your views here.
from api.users.models import User
from google.oauth2 import service_account
from googleapiclient.discovery import build


def authorize_google(request):
    """
    :param request:
    :return:
    """
    # Redirect users to Google sign-in page for authorization
    # Contains Permissions for email, profile, openid and google photos
    authorization_url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri={settings.REDIRECT_URL}&scope=openid email profile https://www.googleapis.com/auth/photoslibrary"
    return redirect(authorization_url)


def google_auth_callback(request):
    """
    :param request:
    :return:
    """
    # Handle the callback URL after user authorization
    code = request.GET.get('code')
    if code:
        # Exchange authorization code for an access token
        token_endpoint = 'https://accounts.google.com/o/oauth2/token'
        token_params = {
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.REDIRECT_URL,
            'grant_type': 'authorization_code'
        }
        response = requests.post(token_endpoint, data=token_params)
        if response.status_code == 200:
            token_data = response.json()
            access_token, token_id = token_data['access_token'], token_data['id_token']

            # Verify the access token
            try:
                id_info = id_token.verify_oauth2_token(
                    token_id, google_requests.Request(), settings.GOOGLE_CLIENT_ID, clock_skew_in_seconds=10
                )
                if id_info['iss'] == 'accounts.google.com' and id_info['aud'] == settings.GOOGLE_CLIENT_ID:
                    # Access token is valid, make API requests
                    # Process to Fetch and Save User Data
                    fetch_client_email(access_token, token_id)
                    response = redirect("/")
                    # Set the Token Id in client browser as a cookie
                    response.set_cookie('u-at', token_id)
                    return response
                else:
                    return HttpResponseBadRequest("Invalid access token.")
            except ValueError:
                return HttpResponseBadRequest("Failed to verify access token.")
        else:
            return HttpResponseBadRequest("Failed to exchange authorization code for access token.")
    else:
        return HttpResponseBadRequest("Authorization code not provided.")


def fetch_client_email(access_token, token_id):
    """
    :param access_token:
    :param token_id:
    :return:
    """
    # Fetch User Detail after authorization and update token
    endpoint = 'https://openidconnect.googleapis.com/v1/userinfo'
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(endpoint, headers=headers)
    if response.status_code == 200:
        user_scope = response.json()
        user_instance = User.objects.get_or_create(
            first_name=user_scope['given_name'],
            last_name=user_scope['family_name'],
            is_active=True,
            is_email_verified=True,
            email=user_scope['email']
        )
        user_instance[0].access_token = access_token
        user_instance[0].token_id = token_id
        user_instance[0].save()
        return user_scope
    else:
        return None


def fetch_client_google_photos(access_token, start_date=None, end_date=None):
    """
    :param access_token:
    :param start_date:
    :param end_date:
    :return:
    """
    # Fetch Google Photos or Media Items based of search params
    endpoint = 'https://photoslibrary.googleapis.com/v1/mediaItems:search'
    headers = {'Authorization': f'Bearer {access_token}'}
    # included Date Range, Media Type and Content Category
    requestbody = {
        "pageSize": "100",
        # "pageSize": "10",
        "filters": {
            "dateFilter": {
                "ranges": [
                    {
                        "startDate": {
                            "day": start_date.day,
                            "month": start_date.month,
                            "year": start_date.year
                        },
                        "endDate": {
                            "day": end_date.day,
                            "month": end_date.month,
                            "year": end_date.year
                        }
                    }
                ]
            },
            "mediaTypeFilter": {
                "mediaTypes": [
                    "PHOTO"
                ]
            }
            # "contentFilter": {
            #     "includedContentCategories": [
            #         "LANDSCAPES"
            #     ]
            # }
        }
    }
    response = requests.post(endpoint, headers=headers, data=json.dumps(requestbody))
    if response.status_code == 200:
        user_scope = response.json()
        return user_scope
    else:
        return None


