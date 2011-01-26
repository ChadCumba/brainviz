from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save
from image_3d.signals import extract_image_data
from image_3d.fields import LargeMatrixField

class image_3d(models.Model):
    user = models.ForeignKey(User, unique=False)
    name = models.CharField(max_length=255, null=False)
    brain_image = models.FileField(upload_to="brainimages")
    brain_data = LargeMatrixField(unique=False, blank=True, null=True,
                                   editable=False)
    def __unicode__(self):
        if self.user is not None:
            return self.user.username
        return 'unknown'
    
pre_save.connect(extract_image_data, sender=image_3d)