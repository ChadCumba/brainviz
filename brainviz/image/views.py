from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.conf import settings
from image.models import ThreeDimensional
from django.contrib.auth.models import User
import nibabel, json
from django.utils.decorators import decorator_from_middleware
from django.middleware.gzip import GZipMiddleware

gzip_page = decorator_from_middleware(GZipMiddleware)

def Upload(request):
    pass

def ImageViewer(request):
    js = ['jquery-1.4.2.min.js', 'bitmapdata/BitmapData.js', 
          'bitmapdata/ColorTransform.js', 'bitmapdata/Matrix.js', 
          'bitmapdata/Point.js', 'bitmapdata/Rectangle.js', 'bitmapdata/Simplex.js',
          'bitmapdata/filters/ColorMatrixFilter.js', 
          'bitmapdata/modes/Difference.js', 'loadData.js', 'playground.js']

    js = [ settings.MEDIA_URL + "javascripts/" + file for file in js]
    
    styles = ['styles.css']
    styles = [ settings.MEDIA_URL + "styles/" + sheet for sheet in styles]
        
    return render_to_response(
        'image/canvas.html',
        {'title':'Image Viewer',
         'js': js,
         'styles': styles,
         },
        context_instance = RequestContext(request))

@gzip_page
def ImageData(request):
    chad = User.objects.get(id=1)
    image = ThreeDimensional.objects.get(user=chad)
    image_list_data = nibabel.load(image.brain_image.file.name).get_data().tolist()
    json_data = json.dumps(image_list_data)
    
    return HttpResponse(json_data, mimetype='application/json')