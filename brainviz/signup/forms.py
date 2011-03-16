# Chad Cumba
# Chad.Cumba@mail.utexas.edu
# Developed in the Poldrack Lab at the University of Texas at Austin

from django.contrib.auth.forms import UserCreationForm
from django import forms

class SignUp(UserCreationForm):
    
    username = forms.CharField()
    email = forms.EmailField()