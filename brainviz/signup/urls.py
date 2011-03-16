# Chad Cumba
# Chad.Cumba@mail.utexas.edu
# Developed in the Poldrack Lab at the University of Texas at Austin

from django.conf.urls.defaults import patterns

urlpatterns = patterns('',
     # Uncomment the next line to enable the admin:
     (r'^$', 'signup.views.register'),
)