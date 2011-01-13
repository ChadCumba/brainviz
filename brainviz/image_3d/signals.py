'''
Created on Jan 12, 2011

@author: chadcumba
'''

from nibabel import load
from brainviz.image_3d.models import image_3d

def extract_image_data(sender, **kwargs):
    image_3d_to_save = kwargs["instance"]
    
    
