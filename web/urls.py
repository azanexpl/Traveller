from django.urls import path

from .views.home import HomeView

# from api.propertycontent.views import PropertyContentView

urlpatterns = [
    # Visitor Website
    path("", view=HomeView.as_view('index'), name="visitor-home"),

    path("map", view=HomeView.as_view('map_detail'), name="visitor-map-detail"),

    path("create", view=HomeView.as_view('create'), name="visitor-create"),

    path("listing", view=HomeView.as_view('listing'), name="visitor-listing"),

    path("detail", view=HomeView.as_view('detail'), name="visitor-detail"),

    path("detail/<int:pk>", view=HomeView.as_view('detail'), name="visitor-detail"),

]
