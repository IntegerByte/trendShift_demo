from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
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
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
