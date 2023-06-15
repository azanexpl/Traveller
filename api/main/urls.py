from django.urls import path

from . import views

urlpatterns = [

    path("google-login", views.authorize_google, name="google-login"),
    path("google-auth-callback", views.google_auth_callback, name="google-auth-callback")

]
