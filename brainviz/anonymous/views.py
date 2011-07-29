from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_protect
from django.template import RequestContext
from django.contrib import messages
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from brainviz.anonymous.forms import UploadImageForm
from brainviz.anonymous.image import process
from django.middleware.gzip import GZipMiddleware
from django.utils.decorators import decorator_from_middleware
from brainviz.image.models import ThreeDimensional
from django.http import Http404
from django.core.urlresolvers import reverse

gzip_page = decorator_from_middleware(GZipMiddleware)

@csrf_protect
def AnonymousUploadForm(request):
    """ Provide a registration form if not authenticated, 
    redirect if authenticated,
    create user and log user in if submitting the form.
    """
    
    if request.method == 'POST':
        form = UploadImageForm(request.POST, request.FILES)
        
        if form.is_valid():
            #save the data in an anonymous user
            new_image = process(request.FILES['image'])
            #new image at this point is a valid three d image

            return HttpResponseRedirect(
                reverse('brainviz.anonymous.views.AnonymousImageDispatch', 
                        kwargs={'image_id': new_image.id}))
        
    form = UploadImageForm()
    
    return render_to_response("anonymous/upload.html", {
        'form' : form
    }, context_instance=RequestContext(request))

@gzip_page
def EmbedJavascriptById(request, **kwargs):
    
    try:
        image = ThreeDimensional.objects.get(id=kwargs['image_id'])
    except:
        raise Http404
    
    javascript_file = open(settings.EMBED_SCRIPT)
    
    javascript_file_data = javascript_file.readlines()
    
    javascript_string = 'window.image_id_to_load=' + str(image.id) + ';' + javascript_file_data[0]
    
    return HttpResponse(javascript_string, mimetype="text/javascript")

def AnonymousImageDispatch(request, **kwargs):
    if 'image_id' not in kwargs:
        raise Http404
    try:
        image = ThreeDimensional.objects.get(id=kwargs['image_id'])
    except:
        raise Http404
    
    return render_to_response("anonymous/dispatch.html", {
        'link': image.get_fq_url(),
        'javascript': reverse('brainviz.anonymous.views.EmbedJavascriptById', kwargs={'image_id':image.id}),
        'iframe' : '<iframe src="'+ image.get_fq_url() +'?bare=true" height="100%" width="100%"></iframe>'
    }, context_instance=RequestContext(request))