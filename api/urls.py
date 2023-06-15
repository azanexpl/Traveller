from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [

    path("users/", include("api.users.urls")),
    path("main/", include("api.main.urls")),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
