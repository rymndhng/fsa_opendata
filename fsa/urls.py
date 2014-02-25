from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # Examples:
     url(r'^line_chart/?$', 'fsa.views.line_chart', name='line_chart'),
     url(r'^data/?$', 'fsa.views.data', name='data'),
)
