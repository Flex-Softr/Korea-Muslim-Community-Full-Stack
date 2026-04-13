# Korea Muslim Community (starter)

Next.js App Router starter with public marketing layout, authenticated dashboard, Prisma, credentials auth (NextAuth v5), email (SMTP), and role-based routes.

## Quick start

```bash
# Create `.env` in the project root (Next.js and Prisma load it automatically).
# Set AUTH_SECRET, DATABASE_URL, and optionally SMTP — see Environment below.

npm install
npx prisma migrate deploy
# Or for local iteration: npm run db:push

npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit smoke tests) |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:push` | Push schema (prototyping; prefer migrate for production) |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (CI/production) |
| `npm run db:seed` | Seed admin user from `.env` |

## Environment

Create **`.env`** in the project root (gitignored). Next.js and Prisma load it automatically. Values are validated in `src/config/load-server-env.ts` and `src/config/public-env.ts`.

### Required

| Variable | Purpose |
|----------|---------|
| **`DATABASE_URL`** | SQLite connection string. Default: `file:./dev.db` (file lives under `prisma/`, path is relative to `schema.prisma`). |
| **`AUTH_SECRET`** | NextAuth signing secret (long random string; e.g. `openssl rand -base64 32`). |

### URLs & public site

| Variable | Purpose |
|----------|---------|
| **`AUTH_URL`** | Optional. Public site URL (no trailing slash); emails, Auth.js. |
| **`NEXT_PUBLIC_APP_URL`** | Optional. Exposed to the browser; sitemap, translate link, `site-url` helpers. Should match how users open the app. |

### App branding

| Variable | Purpose |
|----------|---------|
| **`APP_NAME`** | Optional. Shown in emails/UI where configured. |

### Seed (`npm run db:seed`)

Set **both** or **neither**:

| Variable | Purpose |
|----------|---------|
| **`SEED_USER_EMAIL`** | Account to upsert when seeding. |
| **`SEED_USER_PASSWORD`** | Min 8 characters. |
| **`SEED_USER_NAME`** | Optional display name. |
| **`SEED_USER_ROLE`** | Optional: `USER`, `ADMIN`, or `SUPER_ADMIN` (default `ADMIN`). |

### SMTP & contact mail

Optional locally; set for password reset, verification, and contact form in production:

| Variable | Purpose |
|----------|---------|
| **`EMAIL_FROM`** | From address for outgoing mail. |
| **`SMTP_HOST`**, **`SMTP_PORT`**, **`SMTP_USER`**, **`SMTP_PASSWORD`** | SMTP connection. |
| **`CONTACT_TO_EMAIL`** | Inbox for contact form; if unset, **`EMAIL_FROM`** is used when possible. |

### Example skeleton (copy into `.env` and replace placeholders)

```env
NODE_ENV=development

DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-openssl-rand-base64-32"

AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

APP_NAME="Korea Muslim Community"

# SEED_USER_EMAIL=
# SEED_USER_PASSWORD=
# SEED_USER_NAME=
# SEED_USER_ROLE=ADMIN

# EMAIL_FROM=
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASSWORD=
# CONTACT_TO_EMAIL=
```

## API routes (reference)

- `GET /api/health` — readiness check (503 if the database is down).
- `POST /api/contact` — contact form JSON `{ name, email, message }` (rate limited, sends email).
- Auth: register, NextAuth, forgot/reset password, email verification, change password, profile — see `src/app/api/`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, tests, and build on push/PR to `main` or `master`.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
# NextJsFullStack-Prisma-GenericStarter
# Korea-Muslim-Community-Full-Stack
