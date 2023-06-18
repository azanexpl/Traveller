from django.conf import settings # import the settings file


def settings_constants(request):
    # return the value as a dictionary. can add multiple values in there.
    return {'GOOGLE_MAP_API_KEY': settings.GOOGLE_MAP_API_KEY}