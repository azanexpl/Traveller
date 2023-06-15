"""
Django settings for traveller_app project.

Generated by 'django-admin startproject' using Django 4.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
# STATICFILES_DIRS = [os.path.join(BASE_DIR, "static"),]
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-grl+!8ln7@_0he-dy09876789087&*^fs!_)q2kev*@rzgj'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition


DJANGO_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "django.contrib.sites"
)

THIRD_PARTY_APPS = (
    'rest_framework',
    'rest_framework.authtoken',
    'storages',
    "django.contrib.postgres",
    "debug_toolbar",
    'oauth2_provider',
)


PROJECT_APPS = (
    "main",
    "traveller_app",
    "api",
    "web",
    "api.users",
)

DEBUG_APPS = (
    'corsheaders',
)

INSTALLED_APPS = DJANGO_APPS + PROJECT_APPS + THIRD_PARTY_APPS + DEBUG_APPS



# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels.layers.RedisChannelLayer',
#         'CONFIG': {
#             'hosts': [('localhost', 6379)],
#         },
#     },
# }

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
        'CONFIG': {
            # 'hosts': [('127.0.0.1', 6379)],
        }
    }
}


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'oauth2_provider.middleware.OAuth2TokenMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]


TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request'
)

ROOT_URLCONF = 'traveller_app.urls'


DEBUG_TOOLBAR_PANELS = [
    'debug_toolbar.panels.versions.VersionsPanel',
    'debug_toolbar.panels.timer.TimerPanel',
    'debug_toolbar.panels.settings.SettingsPanel',
    'debug_toolbar.panels.headers.HeadersPanel',
    'debug_toolbar.panels.request.RequestPanel',
    'debug_toolbar.panels.sql.SQLPanel',
    'debug_toolbar.panels.templates.TemplatesPanel',
    'debug_toolbar.panels.cache.CachePanel',
    'debug_toolbar.panels.signals.SignalsPanel',
    'debug_toolbar.panels.logging.LoggingPanel',
    'debug_toolbar.panels.redirects.RedirectsPanel',
]


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True,
        'DIRS': [os.path.join(BASE_DIR, 'templates'), ],
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'traveller_db',
        'USER': os.getenv('PG_USER', 'postgres'),
        'PASSWORD': os.getenv('PG_PASSWD', 'admin'),
        'HOST': os.getenv('PG_HOST', 'localhost'),
        'PORT': '5432',
    }

}

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/


# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

LOGIN_URL = '/admin/login/'

WSGI_APPLICATION = 'traveller_app.wsgi.application'

REST_FRAMEWORK = {
    # "EXCEPTION_HANDLER": "api.permissions.custom_exception_handler",
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    )
}

CORS_ORIGIN_ALLOW_ALL = True

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.AllowAllUsersModelBackend',
    'oauth2_provider.backends.OAuth2Backend',
]

HOST_URL = os.getenv('HOST_URL', 'http://127.0.0.1:8012')
AUTHORIZATION_SERVER_URL = f'{HOST_URL}/api/oauth/token/'
REVOKE_TOKEN_URL = os.getenv(
    'REVOKE_TOKEN_URLs', f'{HOST_URL}/api/oauth/revoke-token/'
)

SENDGRID_API_KEY = ""

OAUTH_CLIENT_ID = 'PYjR5Lnidge4lYl2YRGtqaKkJwdf9DX5KNBbvjOO'  # os.getenv('OAUTH_CLIENT_ID', 'gZUXTS8pj4Wu2pBvd3Z8XBd0rJVUOLfbeHHQe7Tx')

OAUTH_CLIENT_SECRET = '7VCVPN6GHZOY1VCswyEK0kX1tzPbHKH14vtxjRyrHysQphEfu8knASWJ0VDCr2g37qkZf659EFWzzmYVgGfz8ZHc7bMKIwWiOkbXSupbt2VjbdkfOstmHnhRVRcve8SW'

SUPER_ADMIN = ["superadmin@yopmail.com"]


# GOOGLE_CLIENT_ID = '495299794621-0mm6i0h76sit4a6l5f1vvn07tgp7cgoc.apps.googleusercontent.com'
# GOOGLE_CLIENT_SECRET = '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'

# GOOGLE_CLIENT_ID = '439904506830-37uaeur8rj045tn0m78f35lqoionab7r.apps.googleusercontent.com'
# GOOGLE_CLIENT_SECRET = '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'

GOOGLE_CLIENT_ID = '545624527608-2u7986qlbucb3gdd1gh9ka30mu03nihc.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = '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'


REDIRECT_URL = "http://127.0.0.1:8016/api/main/google-auth-callback"


SESSION_COOKIE_SECURE = True