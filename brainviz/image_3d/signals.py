'''
Created on Jan 12, 2011

@author: chadcumba
'''

from nibabel import load
import logging
LOG_FILENAME = '/Users/chadcumba/python.log'
logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG)
logger = logging.getLogger('brainviz')

def extract_image_data(sender, **kwargs):
    pass
    
