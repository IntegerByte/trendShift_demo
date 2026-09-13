from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from cms.models import ExpertiseArea
from cms.sanitize import sanitize_html


class ExpertiseAreaApiTests(APITestCase):
    def setUp(self):
        self.published = ExpertiseArea.objects.create(
            title='Published Area', is_published=True, display_order=0,
        )
        self.draft = ExpertiseArea.objects.create(
            title='Draft Area', is_published=False, display_order=1,
        )
        self.staff = get_user_model().objects.create_user(
            username='staff', password='pw', is_staff=True,
        )
        # Write access requires the "Super Admin" role, not just is_staff,
        # under the two-tier Admin (read-only) / Super Admin access model.
        super_admin_group, _ = Group.objects.get_or_create(name='Super Admin')
        self.staff.groups.add(super_admin_group)
        self.token = Token.objects.create(user=self.staff)

    def test_anonymous_list_only_returns_published(self):
        response = self.client.get('/api/v1/expertise/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.json()]
        self.assertIn('Published Area', titles)
        self.assertNotIn('Draft Area', titles)

    def test_staff_list_includes_drafts(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get('/api/v1/expertise/')
        titles = [item['title'] for item in response.json()]
        self.assertIn('Draft Area', titles)

    def test_anonymous_write_is_rejected(self):
        response = self.client.post('/api/v1/expertise/', {'title': 'Should fail'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_can_create_and_sanitized_html_is_stored(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        payload = {
            'title': 'Sanitized Area',
            'description': '<p>Safe</p><script>alert(1)</script>',
        }
        response = self.client.post('/api/v1/expertise/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        self.assertNotIn('<script>', response.json()['description'])
        self.assertIn('<p>Safe</p>', response.json()['description'])

    def test_admin_role_is_read_only(self):
        read_only_staff = get_user_model().objects.create_user(
            username='readonly', password='pw', is_staff=True,
        )
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        read_only_staff.groups.add(admin_group)
        token = Token.objects.create(user=read_only_staff)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        list_response = self.client.get('/api/v1/expertise/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        write_response = self.client.post('/api/v1/expertise/', {'title': 'Should be blocked'})
        self.assertEqual(write_response.status_code, status.HTTP_403_FORBIDDEN)


class SanitizeHtmlTests(APITestCase):
    def test_strips_script_tags(self):
        cleaned = sanitize_html('<p>Hello</p><script>alert(1)</script>')
        self.assertNotIn('<script>', cleaned)
        self.assertIn('<p>Hello</p>', cleaned)

    def test_strips_event_handler_attributes(self):
        cleaned = sanitize_html('<p onclick="alert(1)">Hi</p>')
        self.assertNotIn('onclick', cleaned)

    def test_allows_expected_formatting_tags(self):
        cleaned = sanitize_html('<p><strong>Bold</strong> and <a href="/x">link</a></p>')
        self.assertIn('<strong>Bold</strong>', cleaned)
        self.assertIn('href="/x"', cleaned)

    def test_empty_value_passes_through(self):
        self.assertEqual(sanitize_html(''), '')


class MediaUploadApiTests(APITestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user(
            username='staff2', password='pw', is_staff=True,
        )
        # Uploading is a write action, so it requires the "Super Admin"
        # role — the Admin (read-only) role cannot upload media.
        super_admin_group, _ = Group.objects.get_or_create(name='Super Admin')
        self.staff.groups.add(super_admin_group)
        self.token = Token.objects.create(user=self.staff)

    def test_anonymous_upload_is_rejected(self):
        response = self.client.post('/api/v1/media/upload/', {})
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_staff_upload_without_file_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post('/api/v1/media/upload/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_role_cannot_upload(self):
        read_only_staff = get_user_model().objects.create_user(
            username='staff3', password='pw', is_staff=True,
        )
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        read_only_staff.groups.add(admin_group)
        token = Token.objects.create(user=read_only_staff)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post('/api/v1/media/upload/', {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
