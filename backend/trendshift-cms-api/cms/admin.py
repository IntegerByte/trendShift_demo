from django.contrib import admin

from .models import (
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

# Django Admin is a superuser/developer fallback for database
# troubleshooting and emergency administration only — routine CMS editing
# happens through the React Admin app (frontend/trendshift-cms-web/src/admin),
# which talks to the same models via the DRF API in cms/api/.


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_enabled', 'url_key')
    list_filter = ('is_enabled',)
    search_fields = ('title', 'meta_title', 'url_key')
    prepopulated_fields = {'url_key': ('title',)}


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_enabled', 'url_key')
    list_filter = ('is_enabled',)
    search_fields = ('title', 'meta_title', 'url_key')
    prepopulated_fields = {'url_key': ('title',)}


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ('address', 'copyright_text')


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'email_from', 'smtp_host')


class ExpertiseCapabilityInline(admin.TabularInline):
    model = ExpertiseCapability
    extra = 1
    ordering = ('display_order',)


@admin.register(ExpertiseArea)
class ExpertiseAreaAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'is_featured', 'display_order', 'updated_at')
    list_filter = ('is_published', 'is_featured')
    search_fields = ('title', 'url_key', 'meta_title', 'meta_description')
    prepopulated_fields = {'url_key': ('title',)}
    ordering = ('display_order', 'title')
    inlines = (ExpertiseCapabilityInline,)


@admin.register(NavigationItem)
class NavigationItemAdmin(admin.ModelAdmin):
    list_display = ('label', 'url', 'placement', 'is_visible', 'display_order')
    list_filter = ('placement', 'is_visible')
    search_fields = ('label', 'url')
    ordering = ('display_order', 'id')


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'email', 'phone', 'is_enabled', 'updated_at')
    list_filter = ('is_enabled',)
    search_fields = ('business_name', 'email', 'phone')


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'is_visible', 'display_order')
    list_filter = ('is_visible',)
    search_fields = ('name', 'role')
    ordering = ('display_order', 'id')


@admin.register(ValueCard)
class ValueCardAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_visible', 'display_order')
    list_filter = ('is_visible',)
    search_fields = ('title',)
    ordering = ('display_order', 'id')


@admin.register(ProcessStep)
class ProcessStepAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_visible', 'display_order')
    list_filter = ('is_visible',)
    search_fields = ('title',)
    ordering = ('display_order', 'id')


@admin.register(PartnerLogo)
class PartnerLogoAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_visible', 'display_order')
    list_filter = ('is_visible',)
    search_fields = ('name',)
    ordering = ('display_order', 'id')


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('name', 'email', 'subject', 'message')
    ordering = ('-created_at',)
