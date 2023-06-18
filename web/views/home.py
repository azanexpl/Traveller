import json
import urllib

from django.db.models import Prefetch

from api.users.models import TravelData
from api.users.serializer import TravelDataSerializer
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

    def map_detail(self, *args, **kwargs):
        return self.render('visitor/map-detail.html')

    def create(self, *args, **kwargs):
        id = self.request.GET.get('id', 0)
        self.edit = False
        self.travel_instance = ""
        if id:
            instance = TravelData.objects.prefetch_related(
                Prefetch(
                    "travel_data_segment",
                    to_attr="segments_data"
                )
            ).get(id=id)
            serializer = TravelDataSerializer(instance).data
            self.travel_instance = urllib.parse.quote(json.dumps(serializer))
            self.edit = True
        return self.render('visitor/create.html')
