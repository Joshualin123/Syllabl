from django.urls import path

from . import views

urlpatterns = [
    path("get-word", views.get_word),
    path("check-word", views.check_word),
]