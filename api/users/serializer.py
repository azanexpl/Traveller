import datetime
import json

from django.db import transaction
from rest_framework import serializers

from api.main.views import fetch_client_google_photos
from api.users.models import User, TravelData, TravelSegmentData


class TravelDataSerializer(serializers.ModelSerializer):
    segments = serializers.CharField(write_only=True)

    class Meta:
        model = TravelData
        exclude = ("created_on", "modified_on", "created_by", 'modified_by', "user")

    def create(self, validated_data):
        with transaction.atomic():
            access_token = self.context.get("access_token")
            segments = validated_data.pop("segments")
            travel_data = TravelData.objects.create(**validated_data)
            for obj in json.loads(segments):
                obj['coordinates'] = json.dumps(obj['coordinates'])
                TravelSegmentData.objects.create(
                    **obj,
                    travel_id=travel_data.id
                )
            return travel_data


class TravelDataSegmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = TravelSegmentData
        exclude = ("created_on", "modified_on", "created_by", 'modified_by', "user")

