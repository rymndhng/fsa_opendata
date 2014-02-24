from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # Examples:
     url(r'^/home?$', 'fsa.views.home', name='home'),
     url(r'^/?$', 'fsa.views.index', name='index'),
)
