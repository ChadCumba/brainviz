from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^upload','brainviz.image_3d.views.Upload'),
)