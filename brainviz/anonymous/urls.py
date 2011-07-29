from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^upload$', 'brainviz.anonymous.views.AnonymousUploadForm'),
    (r'^embedscript/(?P<image_id>\d+).js$', 'brainviz.anonymous.views.EmbedJavascriptById'),    
    (r'^show/(?P<image_id>\d+)$', 'brainviz.anonymous.views.AnonymousImageDispatch'),
)