# Generated by Django 4.2.1 on 2023-06-16 01:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_remove_traveldata_coordinates_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='travelsegmentdata',
            name='images_urls',
        ),
        migrations.AddField(
            model_name='traveldata',
            name='images_urls',
            field=models.TextField(db_column='ImagesUrls', default=None, null=True),
        ),
    ]