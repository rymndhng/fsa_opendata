from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # Examples:
     url(r'^/?$', 'fsa.views.index', name='index'),
     url(r'^line_chart/?$', 'fsa.views.line_chart', name='line_chart'),
     url(r'^data/?$', 'fsa.views.data', name='data'),
     url(r'^districts/?$', 'fsa.views.districts', name='districts'),
     url(r'^districts/(?P<district_id>\d+)/schools/?$', 'fsa.views.schools', name='schools'),
)
