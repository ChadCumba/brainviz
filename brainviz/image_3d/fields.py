from django.db import models
import gzip
import cPickle
from django.forms import CharField
from django.forms.widgets import HiddenInput

class large_matrix(object):
    """An arbitrarily large 3d matrix"""
    
    def __init__(self,list_in_3d):
        self.matrix = list_in_3d
        
    def __unicode__(self):
        return 'large matrix'
        
class LargeMatrixField(models.Field):
    """This is designed to hold and compress the extremely large values that
    can be passed in when doing image calculations.
    """
    description = "An arbitrarily large matrix"
    
    __metaclass__ = models.SubfieldBase
    
    def __init__(self,*args,**kwargs):
        super(LargeMatrixField,self).__init__(*args,**kwargs)
        
    def to_python(self, value):
        """Translate the raw database data into a matrix"""
        if isinstance(value, LargeMatrixField):
            return value
        if value == None or value == '':
            return value
        unzipped_data = gzip.zlib.decompress(value)
        return large_matrix(cPickle.loads(unzipped_data))
    
    def get_prep_value(self,value):
        """Translate the matrix into raw database data"""
        matrix = cPickle.dumps(value)
        return gzip.zlib.compress(matrix)
    
    def db_type(self, connection):
        if connection.settings_dict['ENGINE'] == 'django.db.backends.mysql':
            return 'LONGBLOB'
        elif connection.settings_dict['ENGINE'] == 'django.db.backends.postgres':
            return 'bytea'
        elif connection.settings_dict['ENGINE'] == 'django.db.backends.sqlite3':
            return 'BLOB'
        else:
            raise NotImplementedError
    
    def get_prep_lookup(self, lookup_type, value):
        """This is compressed data. Lookups are completely unsupported"""
        raise TypeError('Lookup not supported on matrix values')
    