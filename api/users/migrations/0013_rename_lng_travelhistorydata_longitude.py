# Generated by Django 4.2.1 on 2023-06-17 16:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_travelhistorydata'),
    ]

    operations = [
        migrations.RenameField(
            model_name='travelhistorydata',
            old_name='lng',
            new_name='longitude',
        ),
    ]
