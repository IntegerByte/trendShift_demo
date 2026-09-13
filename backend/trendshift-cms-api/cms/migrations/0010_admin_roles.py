from django.db import migrations


# Two-tier CMS access model: "Admin" (read-only across the CMS) and
# "Super Admin" (full read/write/delete/edit) — implemented as standard
# Django auth Groups so the existing permission-check plumbing
# (user.groups, user.is_superuser) just works, with no new user model
# needed. A superuser always has full access regardless of group
# membership (see StaffWritePublicReadPermission in cms/api/views.py).
def create_role_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.get_or_create(name='Admin')
    Group.objects.get_or_create(name='Super Admin')


def remove_role_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=['Admin', 'Super Admin']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0009_contactsubmission'),
    ]

    operations = [
        migrations.RunPython(create_role_groups, remove_role_groups),
    ]
