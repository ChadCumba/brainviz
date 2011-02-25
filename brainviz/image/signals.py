'''
Created on Feb 21, 2011

@author: chadcumba
'''

def resize_image(sender, **kwargs):
    from nibabel import load, Nifti1Image
    from nibabel import save as nisave
    from image.transforms import resize
    from numpy import float32, eye, around, nan_to_num
    import gzip, shutil
    from os.path import splitext
    from os import unlink
    
    #if it's not the first time this is created, do not resize
    if not kwargs['created']:
        return
    
    image = kwargs['instance']
    
    image_filename = image.brain_image.file.name

    #here we're dropping the resolution of the image for storage
    #and transfer purposes
    image = load(image_filename)
    image_data = nan_to_num(image.get_data())
    scaled_data = resize(image_data, 60, 72, 60)
    import numpy
    x = numpy.where(scaled_data != 0)
    scaled_data = around(scaled_data, decimals=3)
    x = numpy.where(scaled_data != 0)
    #javascript doesn't handle NaN very well
    scaled_data = nan_to_num(scaled_data)
    x = numpy.where(scaled_data != 0)
    #calling the view() method on the raw data prevents a file save 
    #bug from appearing when we write out the file.
    scaled_image = Nifti1Image(scaled_data.view(dtype=float32),eye(4))
    x = numpy.where(scaled_data != 0)
    unlink(image_filename)
    nisave(scaled_image, image_filename)

    
        