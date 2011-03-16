'''
Created on Jan 11, 2011

@author: chadcumba
'''
from brainviz.image.models import ThreeDimensional, Category
from django.contrib import admin, messages
from django.template.defaultfilters import slugify

class ImageAdmin(admin.ModelAdmin):
   
    exclude = ('user','user_slug','brain_slug',)
    
    list_display = ('__unicode__', 'get_fq_url')
    
    def save_model(self, request, obj, form, change):
        obj.user = request.user
        obj.brain_slug = slugify(request.POST['name'])
        obj.user_slug = slugify(request.user.username)
        obj.save()
        messages.add_message(request, messages.INFO,
            ""
        )

    def queryset(self, request):
        qs = super(ImageAdmin, self).queryset(request)
        if (request.user.is_superuser or 
            request.user.has_perm('image.view_all_threedimensional')):
            return qs
        if request.user.has_perm('image.view_own_threedimensional'):
            return qs.filter(user=request.user)
        return qs.none()
    
    def has_change_permission(self,request, obj=None):
        if request.user.has_perm('image.change_threedimensional'):
            return True
        if obj is None:
            return True
        if (request.user.has_perm('image.change_own_threedimensional') and
            obj.user == request.user):
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.has_perm('image.delete_threedimensional'):
            return True
        if obj is None:
            return False
        if (request.user.has_perm('image.delete_own_threedimensional') and 
            obj.user == request.user):
            return True
        return False

admin.site.register(ThreeDimensional, ImageAdmin)
admin.site.register(Category)