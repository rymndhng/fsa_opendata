from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from django.contrib import admin
admin.autodiscover()

from django.conf import settings
import fsa.urls

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'fsa.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^fsa/', include(fsa.urls)),
)

urlpatterns += staticfiles_urlpatterns()
