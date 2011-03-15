'''
Created on Jan 11, 2011

@author: chadcumba
'''
from brainviz.image.models import ThreeDimensional, Category
from django.contrib import admin

class ImageAdmin(admin.ModelAdmin):
    prepopulated_fields = {'brain_slug' : ('name',),
                           'user_slug': ('user',),}

admin.site.register(ThreeDimensional, ImageAdmin)
admin.site.register(Category)