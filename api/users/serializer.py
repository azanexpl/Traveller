import datetime
import json

from django.db import transaction
from rest_framework import serializers

from api.main.views import fetch_client_google_photos
from api.users.models import User, TravelData, TravelSegmentData


class TravelDataSegmentDetailSerializer(serializers.ModelSerializer):
    title = serializers.CharField(read_only=True, source="travel.title")
    color = serializers.CharField(read_only=True, source="travel.color")

    class Meta:
        model = TravelSegmentData
        exclude = ("created_on", "modified_on", "created_by", 'modified_by')


class TravelDataSegmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = TravelSegmentData
        exclude = ("created_on", "modified_on", "created_by", 'modified_by', 'travel')


class TravelDataSerializer(serializers.ModelSerializer):
    segments = serializers.CharField(write_only=True)
    segments_data = TravelDataSegmentSerializer(read_only=True, many=True)

    class Meta:
        model = TravelData
        exclude = ("created_on", "modified_on", "created_by", 'modified_by', "user")

    def create(self, validated_data):
        with transaction.atomic():
            segments = validated_data.pop("segments")
            travel_data = TravelData.objects.create(**validated_data)
            for obj in json.loads(segments):
                obj['coordinates'] = json.dumps(obj['coordinates'])
                TravelSegmentData.objects.create(
                    **obj,
                    travel_id=travel_data.id
                )
            return travel_data

    def update(self, instance, validated_data):
        with transaction.atomic():
            instance.title = validated_data.get("title", instance.title)
            instance.description = validated_data.get("description", instance.description)
            instance.color = validated_data.get("color", instance.color)
            instance.start_date_time = validated_data.get("start_date_time", instance.start_date_time)
            instance.end_date_time = validated_data.get("end_date_time", instance.end_date_time)
            TravelSegmentData.objects.filter(travel_id=instance.id).delete()
            for obj in json.loads(validated_data.get('segments')):
                obj['coordinates'] = json.dumps(obj['coordinates'])
                TravelSegmentData.objects.create(
                    **obj,
                    travel=instance
                )
            instance.save()
            return instance



