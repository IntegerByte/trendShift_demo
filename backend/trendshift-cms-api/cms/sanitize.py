import bleach

# Allowlist matches what the React Admin rich text editor (TipTap, see
# frontend/trendshift-cms-web/src/admin/RichTextEditor.jsx) can actually
# produce. Anything else submitted through the API — scripts, event
# handler attributes, iframes, etc. — is stripped, not just escaped.
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 's',
    'h2', 'h3', 'h4',
    'ul', 'ol', 'li',
    'blockquote', 'a', 'img',
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt'],
}

ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']


def sanitize_html(value):
    """Strip any HTML outside the rich-text editor's allowlist before it
    reaches the database. Used as a DRF serializer field validator."""
    if not value:
        return value
    return bleach.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
    )
