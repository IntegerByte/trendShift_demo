from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve as serve_static
from rest_framework.authtoken.views import obtain_auth_token

# Django Admin (admin/) is a superuser/developer fallback only — the React
# Admin app (frontend/trendshift-cms-web/src/admin) is the CMS interface
# and authenticates against api/v1/auth/token/ below. There is no
# Django-template-based login/CMS page here on purpose.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('ckeditor5/', include('django_ckeditor_5.urls')),  # Django Admin's rich text widget only
    path('api/v1/', include('cms.api.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/v1/auth/token/', obtain_auth_token, name='token-login'),
    # django.conf.urls.static.static() is a no-op outside DEBUG, and there's
    # no object storage backing MEDIA_ROOT here, so serve it directly. Fine
    # for this deployment's scale; move to S3/R2 + django-storages before
    # this needs to handle real production traffic.
    re_path(r'^media/(?P<path>.*)$', serve_static, {'document_root': settings.MEDIA_ROOT}),
]
