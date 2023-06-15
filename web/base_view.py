from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.shortcuts import redirect, render
from django.utils.decorators import classonlymethod
from django.views import View
from oauth2_provider.models import AccessToken



class BaseView(View):
    @classonlymethod
    # Overriding the default as_view() method
    def as_view(cls, action):
        def view(request, *args, **kwargs):
            # self is the class that calls the as_view()
            self = cls()
            self.action = action  # the url action that is called.
            self.request = request
            self.check_permissions()
            self.get_user()
            return self.dispatch(request, *args, **kwargs)  # process request.

        return view

    # call the requested action
    def dispatch(self, request, *args, **kwargs):
        handler = getattr(self, self.action, None)
        if handler:
            return handler(*args, **kwargs)
        else:
            raise Http404

    def render(self, template):
        return render(self.request, template, self.__dict__)


    def require_authentication(self):
        """
        Verifies the user authentication
        """
        user = self.verify_oauth_token()
        if not user:
            if not self.request.user.is_authenticated:
                raise PermissionDenied
        else:
            self.request.user = user

    def verify_oauth_token(self):
        """
        Verifies access token from cookie.
        :return: user.
        """
        try:
            access_token = self.request.COOKIES.get('u-at', None)
            if access_token:
                return AccessToken.objects.get(token=access_token).user
            else:
                return None
        except AccessToken.DoesNotExist:
            return None

    def get_user(self):
        return self.request.user.id


    def check_permissions(self):
        """
        Checks permissions for views.
        """
        pass

    def redirect(self, *args, **kwargs):
        """
        Redirects to provided URL.
        :param args: list args
        :param kwargs: dict kwargs
        """
        return redirect(*args, **kwargs)
