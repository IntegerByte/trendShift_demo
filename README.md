# Trendshift CMS

A content-managed website for Trendshift. **The React Admin app is the one
and only CMS interface.** Django is API + PostgreSQL + auth/validation
only — it does not render any CMS editing UI of its own. Django Admin
(`/admin/` on the backend) still exists, but purely as a superuser/DB
troubleshooting fallback; see "CMS / Admin" below.

```
┌─────────────────────┐        ┌─────────────────────┐
│  Public React site   │        │  React Admin (/admin) │
│  (Home, Services,    │        │  rich text, media,    │
│   Case Studies, ...)  │        │  publish/reorder, ... │
└──────────┬───────────┘        └──────────┬───────────┘
           │                                │
           └───────────────┬────────────────┘
                            │  REST (JSON + multipart), token auth
                            ▼
                   ┌──────────────────┐
                   │  Django + DRF API │  (validation, sanitization,
                   │  /api/v1/...      │   permissions, media handling)
                   └────────┬─────────┘
                            ▼
                   ┌──────────────────┐        ┌───────────────────────┐
                   │   PostgreSQL      │◄───────┤  Django Admin (/admin/)│
                   │  single source of  │        │  superuser fallback,   │
                   │  truth             │        │  not part of the CMS   │
                   └──────────────────┘        │  workflow               │
                                                 └───────────────────────┘
```

## Project structure

```
trendShift/
├── frontend/
│   └── trendshift-cms-web/     React 18 + Vite public site and admin app
├── backend/
│   └── trendshift-cms-api/     Django 5 + DRF API and Django Admin
├── docs/
│   └── design-reference/       Static HTML/CSS design reference (source of truth for UI/UX)
└── README.md
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.12+
- PostgreSQL 17 (local install, or any reachable Postgres instance)
- Git

## Backend setup

```bash
cd backend/trendshift-cms-api
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt

copy .env.example .env           # then fill in real values
```

### Environment variables (`backend/trendshift-cms-api/.env`)

```
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=trendshift
DATABASE_USER=postgres
DATABASE_PASSWORD=
DATABASE_HOST=localhost
DATABASE_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### PostgreSQL setup

Create the database once PostgreSQL is installed and running:

```bash
psql -U postgres -c "CREATE DATABASE trendshift;"
```

### Migrations, seed data, superuser

```bash
python manage.py migrate
python manage.py seed_trendshift    # 10 expertise areas, case studies, navigation, contact info
python manage.py createsuperuser
```

### Run the API

```bash
python manage.py runserver
```

- API base URL: `http://localhost:8000/api/v1/`
- Django Admin: `http://localhost:8000/admin/`

## Frontend setup

```bash
cd frontend/trendshift-cms-web
npm install
npm run dev
```

- Public site: `http://localhost:5173/`
- React admin app: `http://localhost:5173/admin` (login required — use the Django superuser or any staff account)

Set `VITE_API_URL` in a `.env` file inside `frontend/trendshift-cms-web/` to
point at a non-default API host:

```
VITE_API_URL=http://localhost:8000/api/v1
```

### Production build

```bash
npm run build      # outputs to frontend/trendshift-cms-web/dist
npm run preview     # serve the production build locally
```

## API endpoints (`/api/v1/`)

| Endpoint | Description |
| --- | --- |
| `GET /expertise/` | Published expertise areas (public); all areas for authenticated staff |
| `GET /expertise/{slug}/` | Single expertise area, with capabilities |
| `GET /case-studies/` | Published case studies |
| `GET /case-studies/{slug}/` | Single case study |
| `GET /pages/` | Enabled pages |
| `GET /pages/{id}/` | Single page |
| `GET /navigation/` | Visible navigation items |
| `GET /site-settings/` | Site identity settings |
| `GET /site-configuration/` | Logo, footer address, copyright |
| `GET /contact/` | Enabled contact information |
| `POST /auth/token/` | Obtain an auth token (`{ username, password }`) |
| `POST /media/upload/` | Staff-only image upload for the rich text editor; returns `{ url }` |

Write access (`POST`/`PUT`/`PATCH`/`DELETE`) on every endpoint requires a
staff user's token (`Authorization: Token <token>`). Anonymous requests only
ever see published/enabled content. Rich text fields (`short_description`,
`description` on Expertise Areas/Pages/Case Studies) are sanitized
server-side (`cms/sanitize.py`, allowlist-based via `bleach`) on every
write — scripts, event handler attributes and any tag outside the
allowlist are stripped before the value reaches PostgreSQL.

## CMS / Admin

**The React Admin app (`/admin` on the frontend) is the CMS.** It handles
everything: dashboard, expertise areas (rich text description, capabilities,
Open Graph image, publish/feature toggles, reordering), pages (rich text),
case studies (rich text + card image), navigation (ordering/visibility),
and site settings (site identity, contact info, logo). Rich text uses a
TipTap-based editor (`src/admin/RichTextEditor.jsx`) with an image button
that uploads through `POST /api/v1/media/upload/`; image fields (logo,
card image, OG image) upload as separate multipart requests
(`cmsApi.uploadField`) alongside the main JSON save.

**Django Admin** (`/admin/` on the backend) remains enabled, but only as an
internal superuser/developer fallback for database troubleshooting and
emergency administration — e.g. fixing a corrupted record directly, or
administering users/permissions. It is not linked from anywhere in the
React admin and is not part of the normal content-editing workflow; nothing
in routine CMS work requires opening it.

## Testing

Backend:

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Frontend:

```bash
npm run lint
npm run build
```

## Notes / assumptions

- Public route names stay "Services" / "Case Studies" (matching the design
  reference in `docs/design-reference/`) even though the backend model is
  `ExpertiseArea` — only the data source changed, not the UI vocabulary.
- Team and Partners content remain static in the frontend (not CMS
  entities) — they're outside the entity list the CMS spec calls for.
- The three seeded case studies are placeholder/template copy carried over
  from the original site scaffold, not sourced from the Trendshift content
  document — replace with real client case studies when available.
- Three legacy models from the original scaffold (`Service`, `Menu`,
  `Section`) were removed — they were never exposed via the API or used by
  either frontend, purely leftover Django-Admin-only content types.
