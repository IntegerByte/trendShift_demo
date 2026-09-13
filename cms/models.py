from django_ckeditor_5.fields import CKEditor5Field
from django.db import models
from django.utils.text import slugify


class BaseContentModel(models.Model):
    title = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True, verbose_name='Enable/Disable')
    url_key = models.SlugField(max_length=255, unique=True, blank=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_keywords = models.TextField(blank=True)
    meta_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.url_key:
            self.url_key = slugify(self.title)
        super().save(*args, **kwargs)


class Service(BaseContentModel):
    short_description = CKEditor5Field(blank=True, help_text='Short description for summary cards')
    description = CKEditor5Field(blank=True, help_text='Full description')

    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'

    def __str__(self):
        return self.title


class CaseStudy(BaseContentModel):
    image = models.ImageField(upload_to='case_studies/', blank=True, null=True)
    short_description = CKEditor5Field(blank=True)
    description = CKEditor5Field(blank=True)

    class Meta:
        verbose_name = 'Case Study'
        verbose_name_plural = 'Case Studies'

    def __str__(self):
        return self.title


class Menu(models.Model):
    title = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True, verbose_name='Enable/Disable')
    url_key = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Menu'
        verbose_name_plural = 'Menus'

    def save(self, *args, **kwargs):
        if not self.url_key:
            self.url_key = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Page(BaseContentModel):
    short_description = CKEditor5Field(blank=True)
    description = CKEditor5Field(blank=True)

    class Meta:
        verbose_name = 'Page'
        verbose_name_plural = 'Pages'

    def __str__(self):
        return self.title


class SiteConfiguration(models.Model):
    logo = models.ImageField(upload_to='site/', blank=True, null=True)
    address = models.TextField(blank=True)
    contact_details = models.TextField(blank=True)
    copyright_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Configuration'
        verbose_name_plural = 'Site Configurations'

    def __str__(self):
        return 'Site Configuration'


class Section(models.Model):
    title = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True, verbose_name='Enable/Disable')
    description = CKEditor5Field(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Section'
        verbose_name_plural = 'Sections'

    def __str__(self):
        return self.title


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=255, default='My Website')
    email_from = models.EmailField(blank=True)
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True)
    smtp_password = models.CharField(max_length=255, blank=True, help_text='Store in a secure environment for production.')
    use_tls = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_name


class ExpertiseArea(BaseContentModel):
    short_description = CKEditor5Field(blank=True)
    description = CKEditor5Field(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ('display_order', 'title')
        verbose_name = 'Expertise Area'
        verbose_name_plural = 'Expertise Areas'

    def __str__(self):
        return self.title


class ExpertiseCapability(models.Model):
    expertise_area = models.ForeignKey(
        ExpertiseArea,
        related_name='capabilities',
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('display_order', 'id')
        verbose_name = 'Expertise Capability'
        verbose_name_plural = 'Expertise Capabilities'

    def __str__(self):
        return self.title


class NavigationItem(models.Model):
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    open_in_new_tab = models.BooleanField(default=False)

    class Meta:
        ordering = ('display_order', 'id')
        verbose_name = 'Navigation Item'
        verbose_name_plural = 'Navigation Items'

    def __str__(self):
        return self.label


class ContactInformation(models.Model):
    business_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    is_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name or 'Contact Information'
