from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ckeditor5/', include('django_ckeditor_5.urls')),
    path('api/v1/', include('cms.api.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/v1/auth/token/', obtain_auth_token, name='token-login'),

    path(
        '',
        auth_views.LoginView.as_view(
            template_name='login.html'
        ),
        name='login'
    ),
    path(
        'forgot-password/',
        auth_views.PasswordResetView.as_view(
            template_name='forgot_password.html'
        ),
        name='forgot_password'
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
