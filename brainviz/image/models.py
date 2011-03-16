import os
import uuid
import nibabel
import numpy
import tempfile
import json

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.files.storage import Storage, FileSystemStorage
from django.core.files import File
from image.transforms import resize
from django.contrib.sites.models import Site

#Brain data storage object
#the _save function is specifically overridden to alter the nifti file 
#and save it as json
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
        #we re-open the file as file_system._save() expects an open file 
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

#this strips out the user supplied name and slots in a UUID for the filename.
#this is to prevent a bug that can occur when loading a image into nibabel
#that has a weird file extension.
def get_brain_image_path(instance, filename):
    storage_directory = os.path.join(settings.MEDIA_ROOT, 'brainimages')
    
    unique_name = uuid.uuid4().hex
    
    (root, ext) = os.path.splitext(filename)
    if ext == '.gz':
        (real_root, original_ext) = os.path.splitext(root)
        ext = original_ext + ext       
    
    return os.path.join(storage_directory,unique_name + ext)

class Category(models.Model):
    name = models.CharField(max_length=255, null=False)
    description = models.CharField(max_length=255,null=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __unicode__(self):
        if self.name is not None:
            return self.name
        return 'None'
    
class ThreeDimensional(models.Model):
    
    user = models.ForeignKey(User, unique=False)
    name = models.CharField(max_length=255, null=False)
    brain_image = models.FileField(upload_to=get_brain_image_path, 
                                   storage=BrainDataStorage())
    #this isn't a great naming convention, but I couldn't resist calling it
    #'brain_slug'
    brain_slug = models.SlugField(null=False)
    user_slug = models.SlugField(null=False)
    category = models.ManyToManyField(Category, null=True, blank=True)
    paper_url = models.URLField(null=True, blank=True)
    
    class Meta:
        permissions = (
            ("view_all_threedimensional", "Can view all images"),
            ("view_own_threedimensional", "Can view own images"),
            ("change_own_threedimensional", "Can edit own images"),
            ("delete_own_threedimensional", "Can delete own images"),
        )
        
    def __unicode__(self):
        if self.user is not None:
            return self.user.username + '-' + self.name
        return 'unknown'
    
    @models.permalink
    def get_absolute_url(self):
        return ('image_view', (), {
            'user_name': str(self.user_slug),
            'image_slug': str(self.brain_slug),
        })
    
    def get_fq_url(self):
        return 'http://%s%s' % (Site.objects.get_current().domain,
            self.get_absolute_url())

