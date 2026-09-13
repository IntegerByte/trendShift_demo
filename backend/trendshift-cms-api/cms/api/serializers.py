from django.contrib.auth.models import Group, User
from rest_framework import serializers

from cms.models import (
    CaseStudy,
    ContactInformation,
    ContactSubmission,
    ExpertiseArea,
    ExpertiseCapability,
    NavigationItem,
    Page,
    PartnerLogo,
    ProcessStep,
    SiteConfiguration,
    SiteSettings,
    TeamMember,
    ValueCard,
)
from cms.sanitize import sanitize_html


class RichTextValidationMixin:
    """Sanitizes CKEditor5-produced HTML on the way in, for any serializer
    whose model has `short_description`/`description` rich-text fields."""

    def validate_short_description(self, value):
        return sanitize_html(value)

    def validate_description(self, value):
        return sanitize_html(value)


class ExpertiseCapabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpertiseCapability
        fields = ('id', 'title', 'display_order')


class ExpertiseAreaSerializer(serializers.ModelSerializer):
    capabilities = ExpertiseCapabilitySerializer(many=True, read_only=True)

    class Meta:
        model = ExpertiseArea
        fields = (
            'id', 'title', 'url_key', 'short_description', 'description',
            'display_order', 'is_published', 'is_featured', 'capabilities',
            'meta_title', 'meta_description', 'og_title', 'og_image',
            'created_at', 'updated_at',
        )


class ExpertiseAreaWriteSerializer(RichTextValidationMixin, serializers.ModelSerializer):
    capabilities = ExpertiseCapabilitySerializer(many=True, required=False)

    class Meta:
        model = ExpertiseArea
        fields = (
            'title', 'url_key', 'short_description', 'description',
            'display_order', 'is_published', 'is_featured', 'capabilities',
            'meta_title', 'meta_keywords', 'meta_description', 'og_title', 'og_image',
        )
        extra_kwargs = {'url_key': {'required': False, 'allow_blank': True}}

    def create(self, validated_data):
        capabilities = validated_data.pop('capabilities', [])
        area = ExpertiseArea.objects.create(**validated_data)
        ExpertiseCapability.objects.bulk_create(
            [ExpertiseCapability(expertise_area=area, **capability) for capability in capabilities]
        )
        return area

    def update(self, instance, validated_data):
        capabilities = validated_data.pop('capabilities', None)
        instance = super().update(instance, validated_data)
        if capabilities is not None:
            instance.capabilities.all().delete()
            ExpertiseCapability.objects.bulk_create(
                [ExpertiseCapability(expertise_area=instance, **capability) for capability in capabilities]
            )
        return instance


class PageSerializer(RichTextValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = (
            'id', 'title', 'url_key', 'short_description', 'description',
            'meta_title', 'meta_description', 'og_title', 'og_image',
            'is_enabled', 'updated_at',
        )


class CaseStudySerializer(RichTextValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = CaseStudy
        fields = (
            'id', 'title', 'url_key', 'image', 'short_description', 'description',
            'challenge', 'approach', 'outcome',
            'meta_title', 'meta_description', 'og_title', 'og_image',
            'is_enabled', 'created_at', 'updated_at',
        )

    def validate_challenge(self, value):
        return sanitize_html(value)

    def validate_approach(self, value):
        return sanitize_html(value)

    def validate_outcome(self, value):
        return sanitize_html(value)


class NavigationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavigationItem
        fields = ('id', 'label', 'url', 'display_order', 'is_visible', 'open_in_new_tab', 'placement')


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ('id', 'site_name', 'email_from', 'updated_at')


class ContactInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInformation
        fields = (
            'id', 'business_name', 'email', 'phone', 'address', 'business_hours',
            'facebook_url', 'linkedin_url', 'instagram_url',
        )


class SiteConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfiguration
        fields = ('id', 'logo', 'address', 'contact_details', 'copyright_text', 'updated_at')


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ('id', 'name', 'email', 'phone', 'subject', 'message', 'is_read', 'created_at')
        read_only_fields = ('id', 'created_at')


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ('id', 'name', 'role', 'photo', 'display_order', 'is_visible')


class ValueCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValueCard
        fields = ('id', 'title', 'description', 'display_order', 'is_visible')


class ProcessStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessStep
        fields = ('id', 'title', 'description', 'display_order', 'is_visible')


class PartnerLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerLogo
        fields = ('id', 'name', 'logo', 'display_order', 'is_visible')


def apply_role(user, role):
    """Assigns exactly one of the two CMS access-role groups. Django's
    built-in `is_superuser` flag is separate and intentionally not
    manageable through this serializer — it's a step above either role and
    stays a manage.py/Django Admin concern."""
    super_admin_group, _ = Group.objects.get_or_create(name='Super Admin')
    admin_group, _ = Group.objects.get_or_create(name='Admin')
    if role == 'super_admin':
        user.groups.add(super_admin_group)
        user.groups.remove(admin_group)
    else:
        user.groups.add(admin_group)
        user.groups.remove(super_admin_group)


class AdminUserSerializer(serializers.ModelSerializer):
    """Manages CMS admin accounts and their role (Admin: read-only, Super
    Admin: full read/write/delete/edit) — Super Admin-only, see
    SuperAdminOnlyPermission on AdminUserViewSet."""

    role = serializers.ChoiceField(choices=('admin', 'super_admin'), write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_active', 'is_superuser', 'role', 'password', 'date_joined', 'last_login')
        read_only_fields = ('id', 'is_superuser', 'date_joined', 'last_login')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role'] = 'super_admin' if (instance.is_superuser or instance.groups.filter(name='Super Admin').exists()) else 'admin'
        return data

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'A password is required when creating a new user.'})
        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role', 'admin')
        password = validated_data.pop('password', None)
        validated_data['is_staff'] = True
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        apply_role(user, role)
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role:
            apply_role(instance, role)
        return instance
