from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^upload','brainviz.image.views.Upload'),
)