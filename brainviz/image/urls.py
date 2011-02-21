from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^upload','brainviz.image.views.Upload'),
    (r'^view', 'brainviz.image.views.ImageViewer'),
    (r'^getdata', 'brainviz.image.views.ImageData'),
)