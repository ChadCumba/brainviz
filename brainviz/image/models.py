from django.db import models
from django.contrib.auth.models import User
from image.fields import LargeMatrixField
from django.db.models.signals import post_save
from brainviz.image.signals import resize_image
from os.path import splitext
from django.conf import settings
import os.path, uuid

def get_brain_image_path(instance, filename):
    (root, ext) = splitext(filename)
    storage_directory = os.path.join(settings.MEDIA_ROOT, 'brainimages')
    
    unique_name = uuid.uuid4().hex
    
    (root, ext) = splitext(filename)
    if ext == '.gz':
        (real_root, original_ext) = splitext(root)
        ext = original_ext + ext       
    
    return os.path.join(storage_directory,unique_name + ext)

class ThreeDimensional(models.Model):
    user = models.ForeignKey(User, unique=False)
    name = models.CharField(max_length=255, null=False)
    brain_image = models.FileField(upload_to=get_brain_image_path)
    brain_data = LargeMatrixField(unique=False, blank=True, null=True,
                                   editable=False)
    def __unicode__(self):
        if self.user is not None:
            return self.user.username + '-' + self.name
        return 'unknown'
    


post_save.connect(resize_image,sender=ThreeDimensional)