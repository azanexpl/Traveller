from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models

from main.models import Log
from traveller_app.utils import parse_email


# Create your models here.

class User(AbstractBaseUser, Log, PermissionsMixin):
    """ User model."""
    first_name = models.TextField(db_column='FirstName', default="")
    last_name = models.TextField(db_column='LastName', default="")
    is_active = models.BooleanField(
        db_column='IsActive',
        default=False,
        help_text='Designates whether this user should be treated as active. '
                  'Unselect this instead of deleting accounts.',
    )
    is_approved = models.BooleanField(
        db_column='IsApproved',
        default=True,
        help_text='Designates whether this user is approved or not.',
    )
    email = models.EmailField(unique=True, db_column="Email", help_text="Email Field")
    username = models.CharField(default=None, db_column="Username", null=True, blank=True, max_length=255)
    is_email_verified = models.BooleanField(db_column='IsEmailVerified', default=True)
    is_staff = models.BooleanField(
        default=True,
        help_text='Designates whether the user can log into this admin site.',
    )
    access_token = models.TextField(db_column="AccessToken", default=None, null=True)
    token_id = models.TextField(db_column="token_id", default=None, null=True)

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'

    class Meta:
        db_table = 'Users'

    # def __str__(self):
    #     return f'{self.first_name}'

    def save(self, *args, **kwargs):
        try:
            if not self.pk:
                self.email = parse_email(self.email)
            super().save()
        except Exception:
            raise


class TravelData(Log):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_travel_data", db_column="UserId")
    title = models.CharField(db_column="Title", max_length=255, default=None, null=True)
    description = models.TextField(db_column="Description", default=None, null=True)
    start_date_time = models.DateTimeField(db_column="StartDateTime", default=None, null=True)
    end_date_time = models.DateTimeField(db_column="EndDateTime", default=None, null=True)
    coordinates = models.TextField(db_column="Coordinates", default=None, null=True)
    images_urls = models.TextField(db_column="ImagesUrls", default=None, null=True)
    color = models.CharField(db_column="Color", default=None, null=True)

    class Meta:
        db_table = "TravelData"
