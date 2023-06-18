from django.urls import path

from api.users.views import TravelDataAPIView, TravelDataDeleteAPIView, TravelDataTableAPIView, \
    TravelDataMapDetailAPIView, TravelDataGPSTrailAPIView

urlpatterns = [

    # APIs to GET, POST and PUT Travel Date
    path("travel-data", TravelDataAPIView.as_view(), name="user-travel-data"),
    path("travel-data/<int:pk>", TravelDataAPIView.as_view(), name="user-travel-data"),

    path("travel-data/map-detail", TravelDataMapDetailAPIView.as_view(), name="map_detail_url"),

    path("travel-datatable", TravelDataTableAPIView.as_view(), name="travel_datatable_url"),

    path("upload-gps-trail", TravelDataGPSTrailAPIView.as_view(), name="gps_trail"),

    # APIs to delete Travel Data
    path("travel-data/delete", TravelDataDeleteAPIView.as_view(), name="user-travel-data-delete"),
    path("travel-data/delete/<int:pk>", TravelDataDeleteAPIView.as_view(), name="user-travel-data-delete"),

]
