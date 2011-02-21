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
            return self.user.username
        return 'unknown'
    


post_save.connect(resize_image,sender=ThreeDimensional)

    #def save(self, *args, **kwargs):
#        from nibabel import load, Nifti1Image
#        from nibabel import save as nisave
#        from image.transforms import resize
#        from numpy import float32, eye, around
#        import gzip, shutil
#        from os.path import splitext
#        
#        super(ThreeDimensional, self).save(*args,**kwargs)
#        
#        (root, ext) = splitext(self.brain_image.file.name)
#        
#        if(ext == '.gz'):
#            compressed_file = gzip.open(self.brain_image.file.name, 'rb')
#            uncompressed_file = open(root, 'wb')
#            uncompressed_file.writelines(compressed_file)
#            image_filename = root
#        else:
#            image_filename = self.brain_image.file.name
#
#        #here we're dropping the resolution of the image for storage
#        #and transfer purposes
#        image = load(image_filename)
#        image_data = image.get_data()
#        scaled_data = resize(image_data, 60, 72, 60)
#        scaled_data = around(scaled_data, decimals=3)
#        #calling the view() method on the raw data prevents a file save 
#        #bug from appearing when we write out the file.
#        scaled_image = Nifti1Image(scaled_data.view(dtype=float32),eye(4))
#        nisave(scaled_image, self.brain_image.file.name)
        #here we're writing out the image, then gzipping it in place
        #note that the zipped image doesn't have .gz at the end
        
#        uncompressed_file = open(self.brain_image.file.name, 'rb')
#        compressed_file = gzip.open(self.brain_image.file.name + ".gz", 'wb')
#        compressed_file.writelines(uncompressed_file)
#        uncompressed_file.close()
#        compressed_file.close()
#        shutil.move(compressed_file.name, self.brain_image.file.name)