from brainviz.image.models import ThreeDimensional
from django.contrib.auth.models import User
from django.conf import settings
from django.template import defaultfilters

def create_anonymous_user():
    anon = User()
    anon.username = settings.ANONYMOUS_USERNAME
    anon.save()

def process(image):
    anonymous_image = ThreeDimensional()
    
    if((User.objects.filter(username=settings.ANONYMOUS_USERNAME)).count() == 0):
        create_anonymous_user()
    
    anonymous_user = User.objects.get(username=settings.ANONYMOUS_USERNAME)
    
    anonymous_image.user = anonymous_user
    anonymous_image.name = image.name
    anonymous_image.brain_image = image
    anonymous_image.brain_slug = defaultfilters.slugify(image.name)
    anonymous_image.user_slug = defaultfilters.slugify(settings.ANONYMOUS_USERNAME)
    anonymous_image.save()
    anonymous_image.name = anonymous_image.id
    anonymous_image.brain_slug = defaultfilters.slugify(anonymous_image.id)
    anonymous_image.save()
    return anonymous_image