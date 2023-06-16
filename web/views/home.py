from web.base_view import BaseView


class HomeView(BaseView):
    """
    Template View to render the templates
    """
    def index(self, *args, **kwargs):
        return self.render('visitor/home.html')

    def detail(self, *args, **kwargs):
        self.pk = kwargs.get("pk")
        return self.render('visitor/detail.html')

    def listing(self, *args, **kwargs):
        return self.render('visitor/listing.html')

    def create(self, *args, **kwargs):
        return self.render('visitor/create.html')
