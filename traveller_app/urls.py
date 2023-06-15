"""traveller_app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
# from django.conf.urls import url

from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
import debug_toolbar

new = []
if True:
    django_admin_urls = [
        path('admin/', admin.site.urls),
    ]

urlpatterns = [
                  # path('secure_admin_site/', admin.site.urls),

                  path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
                  path('api/', include('api.urls')),
                  path('', include('web.urls')),

                  # path('main/', include('main.urls'))
                  # path('email/', include(email_urls)),
                  # url(r'^template_preview/', include(template_preview.urls)),
                  # path('__debug__/', include(debug_toolbar.urls)),

              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + django_admin_urls


