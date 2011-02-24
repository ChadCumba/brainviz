from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^upload','brainviz.image.views.Upload'),
    (r'^view', 'brainviz.image.views.ImageViewer'),
    (r'^getbackground', 'brainviz.image.views.BackgroundImage'),
    (r'^getimage', 'brainviz.image.views.ImageData'),
)