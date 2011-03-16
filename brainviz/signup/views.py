# Create your views here.

from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_protect
from django.template import RequestContext
from django.contrib import messages
from django.contrib.auth.views import login as auth_login
from django.contrib.auth import login as login_method
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from brainviz.signup.forms import SignUp



@csrf_protect
def register(request):
    """ Provide a registration form if not authenticated, 
    redirect if authenticated,
    create user and log user in if submitting the form.
    """
    if request.user.is_authenticated():
        messages.add_message(request, messages.INFO, 'You are already signed up')
        return HttpResponseRedirect(reverse('brainviz.image.views.ImageListing'))

    if request.method == 'POST':
        #build the form with our post data
        form = SignUp(request.POST)
        
        if form.is_valid():
            new_user = form.save()
            
            user = authenticate(username = new_user.username,
                                password= request.POST['password1'])
            if user is not None:
                if user.is_active:
                    login_method(request,user)
                    
                    registered_users = Group.objects.get(name="Registered Users")
                    user.groups.add(registered_users)
                    user.is_staff = True
                    user.save()
                    messages.add_message(request, messages.INFO, 'Successfully created and logged in user: '
                        + new_user.username)
                    return HttpResponseRedirect(reverse('brainviz.image.views.ImageListing'))
    else:
        form = SignUp()

    return render_to_response("signup/register.html", {
        'form' : form
    }, context_instance=RequestContext(request))
    

def login(request):
    """Provide a login form if not authenticated, display a message and 
    redirect if authenticated"""
    if request.user.is_authenticated():
        messages.add_message(request, messages.INFO, 'You are already logged in')
        return HttpResponseRedirect(reverse('brainviz.image.views.ImageListing'))
    return auth_login(request)
