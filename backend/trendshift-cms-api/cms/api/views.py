import os
import uuid

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.storage import default_storage
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from cms.models import (
    CaseStudy,
    ContactInformation,
    ContactSubmission,
    ExpertiseArea,
    NavigationItem,
    Page,
    PartnerLogo,
    ProcessStep,
    SiteConfiguration,
    SiteSettings,
    TeamMember,
    ValueCard,
)
from .serializers import (
    AdminUserSerializer,
    CaseStudySerializer,
    ContactInformationSerializer,
    ContactSubmissionSerializer,
    ExpertiseAreaSerializer,
    ExpertiseAreaWriteSerializer,
    NavigationItemSerializer,
    PageSerializer,
    PartnerLogoSerializer,
    ProcessStepSerializer,
    SiteConfigurationSerializer,
    SiteSettingsSerializer,
    TeamMemberSerializer,
    ValueCardSerializer,
)


def is_super_admin(user):
    """Full read/write/delete access: a superuser, or a staff user in the
    "Super Admin" group. Staff users in the "Admin" group (or no group)
    are read-only across the CMS — the two-tier access model."""
    if not (user.is_authenticated and user.is_staff):
        return False
    return user.is_superuser or user.groups.filter(name='Super Admin').exists()


class StaffWritePublicReadPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or is_super_admin(request.user)


class SuperAdminOnlyPermission(permissions.BasePermission):
    """No public or read-only-staff access at all — for actions that are
    "write" in nature even though the HTTP method might be safe in other
    contexts (media upload) or that manage other users' access."""

    def has_permission(self, request, view):
        return is_super_admin(request.user)


class ExpertiseAreaViewSet(viewsets.ModelViewSet):
    permission_classes = (StaffWritePublicReadPermission,)
    lookup_field = 'url_key'

    def get_queryset(self):
        queryset = ExpertiseArea.objects.prefetch_related('capabilities')
        if self.request.method in permissions.SAFE_METHODS and not (
            self.request.user.is_authenticated and self.request.user.is_staff
        ):
            queryset = queryset.filter(is_published=True)
        return queryset

    def get_serializer_class(self):
        return ExpertiseAreaSerializer if self.request.method in permissions.SAFE_METHODS else ExpertiseAreaWriteSerializer


class CaseStudyViewSet(viewsets.ModelViewSet):
    permission_classes = (StaffWritePublicReadPermission,)
    serializer_class = CaseStudySerializer
    lookup_field = 'url_key'

    def get_queryset(self):
        queryset = CaseStudy.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (
            self.request.user.is_authenticated and self.request.user.is_staff
        ):
            queryset = queryset.filter(is_enabled=True)
        return queryset


class PageViewSet(viewsets.ModelViewSet):
    permission_classes = (StaffWritePublicReadPermission,)
    serializer_class = PageSerializer
    lookup_field = 'url_key'

    def get_queryset(self):
        queryset = Page.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (
            self.request.user.is_authenticated and self.request.user.is_staff
        ):
            queryset = queryset.filter(is_enabled=True)
        return queryset


class NavigationItemViewSet(viewsets.ModelViewSet):
    permission_classes = (StaffWritePublicReadPermission,)
    serializer_class = NavigationItemSerializer

    def get_queryset(self):
        queryset = NavigationItem.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (
            self.request.user.is_authenticated and self.request.user.is_staff
        ):
            queryset = queryset.filter(is_visible=True)
        return queryset


class SiteSettingsViewSet(viewsets.ModelViewSet):
    permission_classes = (StaffWritePublicReadPermission,)
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer


class ContactInformationViewSet(viewsets.ModelViewSet):
    permission_classes = (StaffWritePublicReadPermission,)
    queryset = ContactInformation.objects.filter(is_enabled=True)
    serializer_class = ContactInformationSerializer


class PublicCreateStaffReadPermission(permissions.BasePermission):
    """The inverse of StaffWritePublicReadPermission — anyone can submit
    (POST), since the public Contact form has no authenticated user. Any
    staff role can list/view submissions (read-only for "Admin"); marking
    read or deleting is a write action and requires "Super Admin"."""

    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        user = request.user
        if not (user.is_authenticated and user.is_staff):
            return False
        return request.method in permissions.SAFE_METHODS or is_super_admin(user)


class ContactSubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = (PublicCreateStaffReadPermission,)
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer

    def create(self, request, *args, **kwargs):
        # Honeypot: the public form includes a hidden "website" field real
        # visitors never fill in. If it's non-empty this is a bot — report
        # fake success without writing a record, so it doesn't learn it was
        # caught. This is the server-side half of the check the client
        # already does; the client-side one alone is not a security
        # boundary since it can be bypassed by posting directly to the API.
        if request.data.get('website'):
            return Response(status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)


class SiteConfigurationViewSet(viewsets.ModelViewSet):
    permission_classes = (StaffWritePublicReadPermission,)
    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer


class VisibilityFilteredViewSet(viewsets.ModelViewSet):
    """Shared behavior for the simple "content block" collections (Team,
    Values, Process Steps, Partner Logos): public reads only see
    `is_visible=True` records, ordered by `display_order`; staff see all."""

    permission_classes = (StaffWritePublicReadPermission,)
    model = None
    serializer_class = None

    def get_queryset(self):
        queryset = self.model.objects.all()
        if self.request.method in permissions.SAFE_METHODS and not (
            self.request.user.is_authenticated and self.request.user.is_staff
        ):
            queryset = queryset.filter(is_visible=True)
        return queryset


class TeamMemberViewSet(VisibilityFilteredViewSet):
    model = TeamMember
    serializer_class = TeamMemberSerializer


class ValueCardViewSet(VisibilityFilteredViewSet):
    model = ValueCard
    serializer_class = ValueCardSerializer


class ProcessStepViewSet(VisibilityFilteredViewSet):
    model = ProcessStep
    serializer_class = ProcessStepSerializer


class PartnerLogoViewSet(VisibilityFilteredViewSet):
    model = PartnerLogo
    serializer_class = PartnerLogoSerializer


ALLOWED_UPLOAD_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8MB


class MediaUploadView(APIView):
    """Generic image upload used by the React Admin rich text editor's
    image-insert toolbar button. Super Admin-only (it's a write action);
    returns the stored file's public URL. Not a CMS resource itself — no
    read/list/delete, just the one write action the editor needs."""

    permission_classes = (SuperAdminOnlyPermission,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        upload = request.FILES.get('file')
        if upload is None:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        extension = os.path.splitext(upload.name)[1].lower()
        if extension not in ALLOWED_UPLOAD_EXTENSIONS:
            return Response({'detail': 'Unsupported file type.'}, status=status.HTTP_400_BAD_REQUEST)
        if upload.content_type and not upload.content_type.startswith('image/'):
            return Response({'detail': 'Only image uploads are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > MAX_UPLOAD_BYTES:
            return Response({'detail': 'File is too large (max 8MB).'}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.now()
        filename = f'{uuid.uuid4().hex}{extension}'
        path = default_storage.save(f'uploads/{today:%Y/%m}/{filename}', upload)
        url = request.build_absolute_uri(default_storage.url(path))
        return Response({'url': url}, status=status.HTTP_201_CREATED)


def _role_for(user):
    return 'super_admin' if (user.is_superuser or user.groups.filter(name='Super Admin').exists()) else 'admin'


class MeView(APIView):
    """Returns the logged-in user's identity and CMS role, so the React
    Admin UI can conditionally show role-gated things (the Admin Users
    section, read-only messaging) without guessing from the token alone."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
            'is_superuser': user.is_superuser,
            'role': _role_for(user),
        })


class ChangePasswordView(APIView):
    """Lets any authenticated staff user change their own password —
    available to both the Admin and Super Admin roles, since it only
    affects their own account. Rotates the auth token afterward so any
    other signed-in session using the old token is logged out."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        current_password = request.data.get('current_password') or ''
        new_password = request.data.get('new_password') or ''

        if not current_password or not new_password:
            return Response(
                {'detail': 'Both current_password and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.user.check_password(current_password):
            return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=request.user)
        except DjangoValidationError as exc:
            return Response({'detail': ' '.join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()

        # Rotate the token so any other device/session using the old one
        # is signed out — a straightforward password change shouldn't
        # leave a stale credential usable elsewhere.
        Token.objects.filter(user=request.user).delete()
        token = Token.objects.create(user=request.user)
        return Response({'token': token.key})


class AdminUserViewSet(viewsets.ModelViewSet):
    """Create/manage CMS admin accounts and assign their role (Admin:
    read-only, Super Admin: full read/write/delete/edit). Super
    Admin-only end to end, including listing — who else has admin access
    is itself sensitive information."""

    permission_classes = (SuperAdminOnlyPermission,)
    queryset = User.objects.all().order_by('username')
    serializer_class = AdminUserSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pk == request.user.pk:
            return Response({'detail': "You can't delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)
