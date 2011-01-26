'''
Created on Jan 12, 2011

@author: chadcumba
'''
import cPickle
from nibabel import load
import logging
LOG_FILENAME = '/Users/chadcumba/python.log'
logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG)
logger = logging.getLogger('brainviz')

def extract_image_data(sender, **kwargs):
    
    kwargs['instance'].brain_data = cPickle.dumps(['whatever'])
    
    for key in kwargs.keys():
        logger.debug(key)
    logger.debug('exiting')
