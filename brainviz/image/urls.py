from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^upload$','brainviz.image.views.Upload'),
    url(r'^view/(?P<user_name>[\-\w]+)/(?P<image_slug>[\-\w]+)$', 'brainviz.image.views.ImageViewer',
     name='image_view'),
    (r'^view$', 'brainviz.image.views.ImageViewer'),
    (r'^getbackground$', 'brainviz.image.views.BackgroundImage'),
    (r'^getimage/(?P<image_id>\d+)$', 'brainviz.image.views.ImageData'),
    (r'^getimage$', 'brainviz.image.views.ImageData'),
    (r'^getimage/(?P<image_id>\d+).js$', 'brainviz.image.views.CrossSiteImageData'),
    (r'^image_list$','brainviz.image.views.ImageListing'),
    (r'^save$', 'brainviz.image.views.SaveImageString'),
)