# Korea Muslim Community (starter)

Next.js App Router starter with public marketing layout, authenticated dashboard, Prisma, credentials auth (NextAuth v5), email (SMTP), and role-based routes.

## Quick start

```bash
cp .env.example .env
# Edit .env — set AUTH_SECRET, DATABASE_URL, and optionally SMTP.

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

Copy [`.env.example`](./.env.example) to `.env`. Important variables:

- **`AUTH_SECRET`** — required; use a long random string.
- **`DATABASE_URL`** — SQLite default `file:./dev.db` (path is relative to the `prisma/` folder in this template).
- **`AUTH_URL` / `NEXT_PUBLIC_APP_URL`** — public origin; used in emails and for `sitemap.xml` / `robots.txt`.
- **SMTP** (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`) — required in production for password reset, email verification, and the contact form.
- **`CONTACT_TO_EMAIL`** — inbox for contact submissions; if unset, **`EMAIL_FROM`** is used as the recipient (handy for small setups).

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
