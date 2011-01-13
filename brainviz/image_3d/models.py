from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save
from brainviz.image_3d.signals import extract_image_data

class image_3d(models.Model):
    user = models.ForeignKey(User, unique=False)
    name = models.CharField(max_length=255, null=False)
    
    
pre_save.connect(extract_image_data, sender=image_3d)