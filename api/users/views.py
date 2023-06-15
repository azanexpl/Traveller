import datetime
import json
import urllib

import requests
from django.conf import settings
from django.core.exceptions import FieldError
# Create your views here.
from django.db.models import Q
from django.shortcuts import redirect
from django.utils.text import slugify
from rest_framework import status

from api.main.views import fetch_client_google_photos
from api.permissions import GETIsOauthAuthenticated
from api.users.models import User, TravelData
from api.users.serializer import TravelDataSerializer
from api.views import BaseAPIView


class TravelDataAPIView(BaseAPIView):
    """
    API View To GET, POST and PUT Travel Data for a User
    """
    authentication_classes = ()
    permission_classes = (GETIsOauthAuthenticated,)

    def get(self, request, pk=None):
        """
        In this api, only **Super Admin** and **Local Admin** can login. Other users won't be able to login through this API.
        **Mandatory Fields**
        * email
        * password
        """
        try:
            if pk:
                data = TravelData.objects.get(id=pk)
                serializer = TravelDataSerializer(data)
                data_instance = serializer.data
                data_instance['images_urls'] = json.dumps(fetch_client_google_photos(
                    data.user.access_token,
                    start_date=datetime.datetime.strptime(data_instance['start_date_time'], '%Y-%m-%dT%H:%M:%SZ').date(),
                    end_date=datetime.datetime.strptime(data_instance['end_date_time'], '%Y-%m-%dT%H:%M:%SZ').date()
                ))
                return self.send_response(
                    success=True,
                    code=f'200',
                    status_code=status.HTTP_200_OK,
                    payload=data_instance,
                    description="Record Listing",
                )
            data = TravelData.objects.filter().order_by("-start_date_time")
            serializer = TravelDataSerializer(data, many=True)
            return self.send_response(
                success=True,
                code=f'200',
                status_code=status.HTTP_200_OK,
                payload=serializer.data,
                description="Record Listing",
            )
        except TravelData.DoesNotExist:
            return self.send_response(
                code=f'422',
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Travel doesn't exist"
            )
        except FieldError:
            return self.send_response(
                code=f'500',
                description="Cannot resolve keyword given in 'order_by' into field"
            )
        except Exception as e:
            return self.send_response(
                code=f'500',
                description=e
            )

    def post(self, request, pk=None):
        """
        In this api, only **Super Admin** and **Local Admin** can login. Other users won't be able to login through this API.
        **Mandatory Fields**
        * email
        * password
        """
        try:
            date_check = TravelData.objects.filter(
                Q(start_date_time__lte=request.data.get("end_date_time")) &
                Q(end_date_time__gte=request.data.get("start_date_time"))
            )
            if date_check.count() > 0:
                return self.send_response(
                    success=True,
                    code=f'422',
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    description="A travel with in these dates already exists.",
                )
            serializer = TravelDataSerializer(
                data=request.data
            )
            if serializer.is_valid():
                validated_data = serializer.validated_data
                validated_data['user'] = request.user
                images_urls = fetch_client_google_photos(
                    request.user.access_token,
                    start_date=serializer.validated_data['start_date_time'].date(),
                    end_date=serializer.validated_data['end_date_time'].date()
                )
                validated_data['images_urls'] = json.dumps(images_urls)
                serializer.save(**validated_data)
                # arr_ids = []
                # try:
                #     for obj in images_urls['mediaItems']:
                #         arr_ids.append(obj['id'])
                # except:
                #     pass
                # make_photos_public(access_token=request.user.access_token, photo_ids=arr_ids)
                return self.send_response(
                    success=True,
                    code=f'200',
                    status_code=status.HTTP_200_OK,
                    payload={},
                    description="Record Added Successfully",
                )
            else:
                return self.send_response(
                    success=True,
                    code=f'422',
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    description=serializer.errors,
                )
        except TravelData.DoesNotExist:
            return self.send_response(
                code=f'422',
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Travel doesn't exist"
            )
        except FieldError:
            return self.send_response(
                code=f'500',
                description="Cannot resolve keyword given in 'order_by' into field"
            )
        except Exception as e:
            return self.send_response(
                code=f'500',
                description=e
            )

    def put(self, request, pk=None):
        """
        In this api, only **Super Admin** and **Local Admin** can login. Other users won't be able to login through this API.
        **Mandatory Fields**
        * email
        * password
        """
        try:
            instance = TravelData.objects.get(id=pk)
            serializer = TravelDataSerializer(
                instance=instance,
                data=request.data
            )
            if serializer.is_valid():
                validated_data = serializer.validated_data
                validated_data['user'] = request.user
                validated_data['images_urls'] = json.dumps(fetch_client_google_photos(
                    request.user.access_token,
                    start_date=serializer.validated_data['start_date_time'].date(),
                    end_date=serializer.validated_data['end_date_time'].date()
                ))
                serializer.save(**validated_data)
                return self.send_response(
                    success=True,
                    code=f'200',
                    status_code=status.HTTP_200_OK,
                    payload={},
                    description="Record Updated Successfully",
                )
            else:
                return self.send_response(
                    success=True,
                    code=f'422',
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    description=serializer.errors,
                )
        except TravelData.DoesNotExist:
            return self.send_response(
                code=f'422',
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Travel doesn't exist"
            )
        except FieldError:
            return self.send_response(
                code=f'500',
                description="Cannot resolve keyword given in 'order_by' into field"
            )
        except Exception as e:
            return self.send_response(
                code=f'500',
                description=e
            )


class TravelDataDeleteAPIView(BaseAPIView):
    """
    API View To Delete Travel Data
    """
    authentication_classes = ()
    permission_classes = (GETIsOauthAuthenticated,)

    def get(self, request, pk=None):
        """
        In this api, only **Super Admin** and **Local Admin** can login. Other users won't be able to login through this API.
        **Mandatory Fields**
        * email
        * password
        """
        try:
            data = TravelData.objects.get(id=pk).delete()
            return self.send_response(
                success=True,
                code=f'200',
                status_code=status.HTTP_200_OK,
                description="Record Deleted Successfully",
            )
        except TravelData.DoesNotExist:
            return self.send_response(
                code=f'422',
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="No record found of this id"
            )
        except FieldError:
            return self.send_response(
                code=f'500',
                description="Cannot resolve keyword given in 'order_by' into field"
            )
        except Exception as e:
            return self.send_response(
                code=f'500',
                description=e
            )
