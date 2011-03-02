from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.conf import settings
from image.models import ThreeDimensional
from django.contrib.auth.models import User
import nibabel, json
from django.utils.decorators import decorator_from_middleware
from django.middleware.gzip import GZipMiddleware
from numpy import nan_to_num, ndarray, array, float32
from django.core.paginator import Paginator, InvalidPage, EmptyPage

gzip_page = decorator_from_middleware(GZipMiddleware)

def Upload(request):
    pass

def ImageViewer(request, **kwargs):
    js = ['jquery-1.4.2.min.js', 'loadData.js', 'playground.js',
          'events.js', 'extend.js', 'onLoad.js',
          'brainRenderer.js', 'js16Additions.js', 'observer.js',
          'viewer.js', 'brainData.js', 'canvasRenderer.js', 
          'crosshairsRenderer.js', 'interface.js', 'rendererInterface.js',
          'urlParameters.js', 'eventBindings.js']

    js = [ settings.MEDIA_URL + "javascripts/" + file for file in js]
    
    styles = ['styles.css']
    styles = [ settings.MEDIA_URL + "styles/" + sheet for sheet in styles]
    
    if 'user_name' in kwargs:
        user_name = kwargs['user_name']
    else:
        user_name = 'chad'
    if 'image_name' in kwargs:
        image_name = kwargs['image_name']
    else:
        image_name = '654'
    
    image_queryset = ThreeDimensional.objects.filter(name=image_name)
    if image_queryset.count() is not 1:
        image_owner = User.objects.get(username=user_name)
        image_queryset.filter(user=image_owner)
        if image_queryset.count() is not 1:
            return render_to_response('generic/base.html',
                        {'content': "Something went wrong"},
                        context_instance = RequestContext(request))
    
    
    image_id = image_queryset[0].id
    
    return render_to_response(
        'image/canvas.html',
        {'title':'Image Viewer',
         'js': js,
         'styles': styles,
         'image_id' : image_id,
         },
        context_instance = RequestContext(request))

@gzip_page
def BackgroundImage(request):
    chad = User.objects.get(id=1)
    image = ThreeDimensional.objects.filter(user=chad)[0]
        
    image_handle = nibabel.load(image.brain_image.file.name)
    image_data = image_handle.get_data() 
    image_list_data = image_data.tolist()
    
    #for some reason ndarray.max returns an ndarray with 1 member
    #which is a numpy.flaot32. this converts all that to a regular python float    
    max = ndarray.max(image_data).tolist()
    min = ndarray.min(image_data).tolist()
   
    
    json_object = {
                   'data' : image_list_data,
                   'max' : max,
                   'min' : min,
    }

    
    json_data = json.dumps(json_object)
    
    return HttpResponse(json_data, mimetype='application/json')

@gzip_page
def ImageData(request, **kwargs):
    
    if 'image_id' in kwargs:
        image_id = kwargs['image_id']
    else:
        image_id = 1

    image = ThreeDimensional.objects.get(id = image_id)
    image_handle = nibabel.load(image.brain_image.file.name)
    image_data = image_handle.get_data() 
    image_list_data = image_data.tolist()
    
    #for some reason ndarray.max returns an ndarray with 1 member
    #which is a numpy.flaot32. this converts all that to a regular python float    
    max = ndarray.max(image_data).tolist()
    min = ndarray.min(image_data).tolist()
    
    json_object = {
                   'data' : image_list_data,
                   'max' : max,
                   'min' : min,
    }

    
    json_data = json.dumps(json_object)
    
    return HttpResponse(json_data, mimetype='application/json')

def ImageListing(request):
    image_list = ThreeDimensional.objects.all()
    paginator = Paginator(image_list, 25) 

    # Make sure page request is an int. If not, deliver first page.
    try:
        page = int(request.GET.get('page', '1'))
    except ValueError:
        page = 1

    # If page request (9999) is out of range, deliver last page of results.
    try:
        images = paginator.page(page)
    except (EmptyPage, InvalidPage):
        images = paginator.page(paginator.num_pages)

    return render_to_response('image/list.html', {"images": images})