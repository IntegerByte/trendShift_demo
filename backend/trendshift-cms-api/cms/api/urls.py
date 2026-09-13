from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminUserViewSet,
    CaseStudyViewSet,
    ChangePasswordView,
    ContactInformationViewSet,
    ContactSubmissionViewSet,
    ExpertiseAreaViewSet,
    MediaUploadView,
    MeView,
    NavigationItemViewSet,
    PageViewSet,
    PartnerLogoViewSet,
    ProcessStepViewSet,
    SiteConfigurationViewSet,
    SiteSettingsViewSet,
    TeamMemberViewSet,
    ValueCardViewSet,
)

router = DefaultRouter()
router.register('expertise', ExpertiseAreaViewSet, basename='expertise')
router.register('case-studies', CaseStudyViewSet, basename='case-studies')
router.register('pages', PageViewSet, basename='pages')
router.register('navigation', NavigationItemViewSet, basename='navigation')
router.register('site-settings', SiteSettingsViewSet, basename='site-settings')
router.register('contact', ContactInformationViewSet, basename='contact')
router.register('contact-submissions', ContactSubmissionViewSet, basename='contact-submissions')
router.register('site-configuration', SiteConfigurationViewSet, basename='site-configuration')
router.register('team', TeamMemberViewSet, basename='team')
router.register('values', ValueCardViewSet, basename='values')
router.register('process-steps', ProcessStepViewSet, basename='process-steps')
router.register('partners', PartnerLogoViewSet, basename='partners')
router.register('admin-users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('media/upload/', MediaUploadView.as_view(), name='media-upload'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
] + router.urls
