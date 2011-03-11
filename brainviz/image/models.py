import os
import uuid
import errno
import nibabel
import numpy
import tempfile
import json

from django.db import models
from django.contrib.auth.models import User
from image.fields import LargeMatrixField
from django.db.models.signals import post_save
from brainviz.image.signals import resize_image
from django.conf import settings
from django.core.files.storage import Storage, FileSystemStorage
from django.core.files.move import file_move_safe
from django.core.files import locks, File
from image.transforms import resize

class BrainDataStorage(Storage):
    
    def _open(self, name, mode='rb'):
        file_system = FileSystemStorage()
        return file_system._open(name,mode)

    def _save(self, name, content):
        
        file_system = FileSystemStorage()
        image_filename = file_system._save(name,content)
    
        #here we're dropping the resolution of the image for storage
        #and transfer purposes
        image = nibabel.load(image_filename)
        image_data = numpy.nan_to_num(image.get_data())
        scaled_data = resize(image_data, 60, 72, 60)
        
        scaled_data = numpy.around(scaled_data, decimals=3)
        
        #javascript doesn't handle NaN very well
        scaled_data = numpy.nan_to_num(scaled_data)
        
        scaled_list_data = scaled_data.tolist()
        
        os.unlink(image_filename)
        
        #for some reason ndarray.max returns an ndarray with 1 member
        #which is a numpy.flaot32. this converts all that to a regular python float    
        max = numpy.ndarray.max(scaled_data).tolist()
        min = numpy.ndarray.min(scaled_data).tolist()
        
        json_data = {"data": scaled_list_data, "max" : max, "min": min}
              
        
        javascript_tempfile= File(open(tempfile.mktemp(), 'w'))
        javascript_tempfile.open('w')
        javascript_tempfile.writelines(json.dumps(json_data))
        javascript_tempfile.close()
        javascript_tempfile.open('r')
        
        (root, ext) = os.path.splitext(image_filename)
        if ext == '.gz':
            (root, original_ext) = os.path.splitext(root)
            ext = original_ext + ext
            
        return file_system._save(root+'.json',javascript_tempfile)
    
    def delete(self, name):
        file_system = FileSystemStorage()
        file_system.delete(name)

    def exists(self, name):
        file_system = FileSystemStorage()
        return file_system.exists(name)
        
    def listdir(self, path):
        file_system = FileSystemStorage()
        return file_system.listdir(path)
    
    def size(self, name):
        file_system = FileSystemStorage()
        return file_system.size(name)

    def url(self, name):
        file_system = FileSystemStorage()
        return file_system.url(name)

def get_brain_image_path(instance, filename):
    (root, ext) = os.path.splitext(filename)
    storage_directory = os.path.join(settings.MEDIA_ROOT, 'brainimages')
    
    unique_name = uuid.uuid4().hex
    
    (root, ext) = os.path.splitext(filename)
    if ext == '.gz':
        (real_root, original_ext) = os.path.splitext(root)
        ext = original_ext + ext       
    
    return os.path.join(storage_directory,unique_name + ext)



class ThreeDimensional(models.Model):
    user = models.ForeignKey(User, unique=False)
    name = models.CharField(max_length=255, null=False)
    brain_image = models.FileField(upload_to=get_brain_image_path, 
                                   storage=BrainDataStorage())
    brain_data = LargeMatrixField(unique=False, blank=True, null=True,
                                   editable=False)
    brain_slug = models.SlugField(null=False)
    user_slug = models.SlugField(null=False)
    
    def __unicode__(self):
        if self.user is not None:
            return self.user.username + '-' + self.name
        return 'unknown'
    

