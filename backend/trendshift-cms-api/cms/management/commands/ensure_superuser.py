import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Create or update the superuser from DJANGO_SUPERUSER_USERNAME/"
        "EMAIL/PASSWORD env vars. Idempotent and safe to run on every "
        "deploy -- resets the password to match the env var each time, "
        "so rotating DJANGO_SUPERUSER_PASSWORD and redeploying is how you "
        "reset a forgotten password on plans without Shell access."
    )

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')

        if not username or not password:
            self.stdout.write('DJANGO_SUPERUSER_USERNAME/PASSWORD not set, skipping.')
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email},
        )
        user.email = email or user.email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        self.stdout.write(f'{"Created" if created else "Updated"} superuser "{username}".')
