from django.urls import path

from api.users.views import TravelDataAPIView, TravelDataDeleteAPIView

urlpatterns = [

    # APIs to GET, POST and PUT Travel Date
    path("travel-data", TravelDataAPIView.as_view(), name="user-travel-data"),
    path("travel-data/<int:pk>", TravelDataAPIView.as_view(), name="user-travel-data"),

    # APIs to delete Travel Data
    path("travel-data/delete", TravelDataDeleteAPIView.as_view(), name="user-travel-data-delete"),
    path("travel-data/delete/<int:pk>", TravelDataDeleteAPIView.as_view(), name="user-travel-data-delete"),

]
