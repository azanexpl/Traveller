from rest_framework import serializers

from api.users.models import User, TravelData


class TravelDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = TravelData
        exclude = ("created_on", "modified_on", "created_by", 'modified_by', "user")

