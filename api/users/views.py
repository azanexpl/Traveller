import datetime
import json

from django.core.exceptions import FieldError
# Create your views here.
from django.db import transaction
from django.db.models import Q, Prefetch
from model_utils import Choices
from rest_framework import status
from rest_framework.parsers import MultiPartParser

from api.main.views import fetch_client_google_photos
from api.permissions import GETIsOauthAuthenticated
from api.users.models import TravelData, TravelSegmentData, TravelHistoryData
from api.users.serializer import TravelDataSerializer, TravelDataSegmentSerializer, TravelDataSegmentDetailSerializer
from api.views import BaseAPIView
from traveller_app.utils import query_datatable_by_args_countries
import os
import zipfile
from django.core.files import File
from django.conf import settings


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
                data = TravelData.objects.prefetch_related(
                    Prefetch(
                        "travel_data_segment",
                        to_attr="segments_data"
                    )
                ).get(id=pk)
                serializer = TravelDataSerializer(data)
                data_instance = serializer.data
                start_date = datetime.datetime.strptime(data_instance['start_date_time'],
                                                          '%Y-%m-%dT%H:%M:%SZ')
                end_date = datetime.datetime.strptime(data_instance['end_date_time'], '%Y-%m-%dT%H:%M:%SZ')
                data_instance['images_urls'] = json.dumps(fetch_client_google_photos(
                    data.user.access_token,
                    start_date=start_date.date(),
                    end_date=end_date.date()
                ))
                data_instance['travel_history'] = TravelHistoryData.objects.filter(
                    start_date_time__gte=start_date,
                    start_date_time__lte=end_date
                ).order_by('-start_date_time').values('start_date_time', "end_date_time", "latitude", "longitude")
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
                data=request.data,
                context={
                    "access_token": request.user.access_token
                }
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


class TravelDataMapDetailAPIView(BaseAPIView):
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
            data = TravelData.objects.prefetch_related(
                Prefetch(
                    "travel_data_segment",
                    to_attr="segments_data"
                )
            )
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


class TravelDataTableAPIView(BaseAPIView):
    """
    API View for Login Super Admin and Admin
    """
    authentication_classes = ()
    permission_classes = (GETIsOauthAuthenticated,)

    def get(self, request, pk=None):
        """
        :param request:
        :param pk: to get singal instance of property
        :return: response of required properties listings
        """
        try:
            query_object = Q()
            start_date = request.query_params.get('start_date', "")
            end_date = request.query_params.get('end_date', "")

            if start_date:
                query_object &= Q(start_date_time__date__gte=start_date)

            if end_date:
                query_object &= Q(end_date_time__date__lte=end_date)

            ORDER_COLUMN_CHOICES = Choices(
                ('0', 'id'),
                ('1', 'type'),
                ('4', 'id'),
                ('6', 'description')
            )
            property_ = query_datatable_by_args_countries(
                kwargs=request.query_params,
                model=TravelData,
                query_object=query_object,
                ORDER_COLUMN_CHOICES=ORDER_COLUMN_CHOICES,
                search_function=self.search_data
            )

            serializer = TravelDataSerializer(property_.get('items', []), many=True)

            property_data = {
                'draw': property_.get('draw', 0),
                'recordsTotal': property_.get('total', 0),
                'recordsFiltered': property_.get('count', 0),
                'data': serializer.data,
            }
            description = 'List of jobs'

            return self.send_response(
                success=True,
                status_code=status.HTTP_200_OK,
                payload=property_data,
                description=description
            )

        except TravelData.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description=str(e)
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )

    @staticmethod
    def search_data(queryset, search_value, kwargs):
        """
        search given queryset with given search_value
        :param list queryset: all records of a model
        :param str search_value: value user enter in datatable search
        :param dict kwargs: request param from datatable
        :rtype:list
        """
        try:
            query_object = Q(id__icontains=search_value) | Q(title__icontains=search_value)
            query_object |= Q(description__icontains=search_value)
            return queryset.filter(query_object)
        except:
            return []


class TravelDataGPSTrailAPIView(BaseAPIView):
    """
    API View for Login Super Admin and Admin
    """
    authentication_classes = ()
    permission_classes = (GETIsOauthAuthenticated,)
    parser_classes = (MultiPartParser,)

    def post(self, request, pk=None):
        """
        In this api, only **Super Admin** and **Local Admin** can login. Other users won't be able to login through this API.
        **Mandatory Fields**
        * email
        * password
        """
        try:
            with transaction.atomic():
                destination_folder = os.path.join(settings.MEDIA_ROOT, 'unzipped_files')
                history_path = destination_folder
                uploaded_file = request.FILES['file']
                # Create the destination folder if it doesn't exist
                os.makedirs(destination_folder, exist_ok=True)
                zip_file_path = os.path.join(destination_folder, uploaded_file.name)
                with open(zip_file_path, 'wb') as file:
                    for chunk in uploaded_file.chunks():
                        file.write(chunk)
                # Unzip the uploaded file
                # with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
                #     zip_ref.extractall(destination_folder)

                filtered_files = []
                TravelHistoryData.objects.filter().delete()
                file_path = os.path.join(history_path, 'History')
                with open(zip_file_path, 'r', encoding='utf-8') as file:
                    json_data = file.read()
                    data = json.loads(json_data)
                    arr_= []
                    timeline_items = data['locations']
                    for obj in timeline_items:
                        try:
                            arr_.append(TravelHistoryData(
                                latitude=obj['latitudeE7'] / 1e7,
                                longitude=obj['longitudeE7'] / 1e7,
                                start_date_time=obj['timestamp'],
                                user_id=request.user.id
                            ))
                        except Exception as e:
                            pass
                    TravelHistoryData.objects.bulk_create(arr_)

                os.remove(zip_file_path)
                # if os.path.exists(file_path):
                    # for json_file in os.listdir(file_path):
                        # #Open files and fetch data
                        # with open(os.path.join(file_path, json_file), 'r', encoding='utf-8') as file:
                        #     json_data = file.read()
                        #     data = json.loads(json_data)
                        #     arr_= []
                        #     timeline_items = data['timelineObjects']
                        #
                        #     for item in timeline_items:
                        #         # Access specific attributes of each timeline item
                        #         # if 'placeVisit' in item:
                        #         #     arr_obj = {}
                        #         #     place_visit = item['placeVisit']
                        #         #     location = place_visit['location']
                        #         #     latitude = location['latitudeE7'] / 1e7
                        #         #     longitude = location['longitudeE7'] / 1e7
                        #         #     duration = place_visit['duration']
                        #         #     start_date_time = duration['startTimestamp']
                        #         #     end_date_time = duration['endTimestamp']
                        #         #     arr_.append(TravelHistoryData(
                        #         #         latitude=latitude,
                        #         #         longitude=longitude,
                        #         #         start_date_time=start_date_time,
                        #         #         end_date_time=end_date_time,
                        #         #         user_id=request.user.id
                        #         #     ))
                        #         if 'activitySegment' in item:
                        #             arr_obj = {}
                        #             activitySegment = item['activitySegment']
                        #             start_location = activitySegment['startLocation']
                        #             start_latitude = start_location['latitudeE7'] / 1e7
                        #             start_longitude = start_location['longitudeE7'] / 1e7
                        #             end_location = activitySegment['endLocation']
                        #             end_latitude = end_location['latitudeE7'] / 1e7
                        #             end_longitude = end_location['longitudeE7'] / 1e7
                        #             duration = activitySegment['duration']
                        #             start_date_time = duration['startTimestamp']
                        #             end_date_time = duration['endTimestamp']
                        #             arr_.append(TravelHistoryData(
                        #                 latitude=start_latitude,
                        #                 longitude=start_longitude,
                        #                 start_date_time=start_date_time,
                        #                 end_date_time=end_date_time,
                        #                 user_id=request.user.id
                        #             ))
                        #             arr_.append(TravelHistoryData(
                        #                 latitude=end_latitude,
                        #                 longitude=end_longitude,
                        #                 start_date_time=start_date_time,
                        #                 end_date_time=end_date_time,
                        #                 user_id=request.user.id
                        #             ))
                        # TravelHistoryData.objects.bulk_create(arr_)
                # else:
                #     return self.send_response(
                #         status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                #         description="Invalid File Format. Please Check our Instructions.",
                #     )

            return self.send_response(
                success=True,
                code=f'200',
                status_code=status.HTTP_200_OK,
                payload={},
                description="Record Added Successfully",
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

