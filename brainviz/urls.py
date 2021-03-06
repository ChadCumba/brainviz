from django.conf.urls.defaults import *
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^brainviz/', include('brainviz.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    (r'^admin/', include(admin.site.urls)),
    (r'^static/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT}),
    (r'^image/', include('brainviz.image.urls')),
    (r'^$', 'brainviz.image.views.ImageListing'),
    (r'^signup/$',include('brainviz.signup.urls')),
    (r'^anonymous/', include('brainviz.anonymous.urls')),
)
