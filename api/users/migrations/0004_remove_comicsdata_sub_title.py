# Generated by Django 4.2.1 on 2023-05-29 21:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_comicsdata_slug'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comicsdata',
            name='sub_title',
        ),
    ]
