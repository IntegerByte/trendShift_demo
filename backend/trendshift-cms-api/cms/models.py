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
    og_title = models.CharField(max_length=255, blank=True, help_text='Falls back to meta title when blank.')
    og_image = models.ImageField(upload_to='og/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.url_key:
            self.url_key = slugify(self.title)
        super().save(*args, **kwargs)


class CaseStudy(BaseContentModel):
    image = models.ImageField(upload_to='case_studies/', blank=True, null=True)
    short_description = CKEditor5Field(blank=True)
    description = CKEditor5Field(blank=True)
    challenge = CKEditor5Field(blank=True, verbose_name='The challenge')
    approach = CKEditor5Field(blank=True, verbose_name='Our approach')
    outcome = CKEditor5Field(blank=True, verbose_name='The outcome')

    class Meta:
        verbose_name = 'Case Study'
        verbose_name_plural = 'Case Studies'

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
    PLACEMENT_HEADER = 'header'
    PLACEMENT_FOOTER = 'footer'
    PLACEMENT_BOTH = 'both'
    PLACEMENT_CHOICES = [
        (PLACEMENT_HEADER, 'Header only'),
        (PLACEMENT_FOOTER, 'Footer only'),
        (PLACEMENT_BOTH, 'Header & footer'),
    ]

    label = models.CharField(max_length=100)
    url = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    open_in_new_tab = models.BooleanField(default=False)
    placement = models.CharField(max_length=10, choices=PLACEMENT_CHOICES, default=PLACEMENT_HEADER)

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
    business_hours = models.CharField(max_length=255, blank=True)
    facebook_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    is_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name or 'Contact Information'


class TeamMember(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to='team/', blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ('display_order', 'id')
        verbose_name = 'Team Member'
        verbose_name_plural = 'Team Members'

    def __str__(self):
        return self.name


class ValueCard(models.Model):
    """Mission / Vision / Values cards on the About page."""

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ('display_order', 'id')
        verbose_name = 'Mission/Vision/Value Card'
        verbose_name_plural = 'Mission, Vision & Values'

    def __str__(self):
        return self.title


class ProcessStep(models.Model):
    """"How we work" steps on the Services page."""

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ('display_order', 'id')
        verbose_name = 'Process Step'
        verbose_name_plural = 'How We Work Steps'

    def __str__(self):
        return self.title


class PartnerLogo(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='partners/', blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ('display_order', 'id')
        verbose_name = 'Partner Logo'
        verbose_name_plural = 'Partner Logos'

    def __str__(self):
        return self.name


class ContactSubmission(models.Model):
    """A visitor-submitted Contact Us form entry. Publicly creatable (the
    public site has no auth), staff-only to read/manage — see
    ContactSubmissionViewSet's permission class."""

    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=150)
    message = models.TextField(max_length=2000)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Contact Submission'
        verbose_name_plural = 'Contact Submissions'

    def __str__(self):
        return f'{self.name} — {self.subject}'
