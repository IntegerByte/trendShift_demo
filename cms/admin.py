from django.contrib import admin

from .models import (
    CaseStudy,
    ContactInformation,
    ExpertiseArea,
    ExpertiseCapability,
    Menu,
    NavigationItem,
    Page,
    Section,
    Service,
    SiteConfiguration,
    SiteSettings,
)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_enabled', 'url_key')
    list_filter = ('is_enabled',)
    search_fields = ('title', 'meta_title', 'url_key')
    prepopulated_fields = {'url_key': ('title',)}


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_enabled', 'url_key')
    list_filter = ('is_enabled',)
    search_fields = ('title', 'meta_title', 'url_key')
    prepopulated_fields = {'url_key': ('title',)}


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_enabled', 'url_key')
    list_filter = ('is_enabled',)
    search_fields = ('title', 'url_key')
    prepopulated_fields = {'url_key': ('title',)}


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_enabled', 'url_key')
    list_filter = ('is_enabled',)
    search_fields = ('title', 'meta_title', 'url_key')
    prepopulated_fields = {'url_key': ('title',)}


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_enabled')
    list_filter = ('is_enabled',)
    search_fields = ('title',)


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
    list_display = ('label', 'url', 'is_visible', 'display_order')
    list_filter = ('is_visible',)
    search_fields = ('label', 'url')
    ordering = ('display_order', 'id')


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'email', 'phone', 'is_enabled', 'updated_at')
    list_filter = ('is_enabled',)
    search_fields = ('business_name', 'email', 'phone')
