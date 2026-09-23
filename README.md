# KZero conference lead capture

A mobile-first Next.js website for collecting conference leads from a booth QR code. Submissions are written to PostgreSQL before confirmation is shown. The private team area supports demo-first sorting, search, contacted status, notes, and a Zoho-friendly CSV export.

## What is included

- Public lead form at `/`
- Password-protected lead desk at `/team`
- PostgreSQL persistence through Prisma
- Server-side validation and retry-safe idempotent submissions
- Protected CSV download with event name and explicit column headings
- No Zoho integration, analytics, or marketing-consent assumptions

## 1. Create the hosted database

This project works with any Vercel-accessible PostgreSQL database. Neon through the Vercel Marketplace is a simple option:

1. Open the project in the Vercel dashboard after importing it (the next section explains the import).
2. Open **Storage**, choose **Create Database**, and select **Neon Postgres**.
3. Connect the database to this project and all environments that should receive leads.
4. Confirm that Vercel created a `DATABASE_URL` environment variable. If the integration supplies a differently named pooled URL, copy its value into a new variable named `DATABASE_URL`.
5. Redeploy. The `vercel-build` script runs the committed Prisma migration before building the site.

For another provider such as Supabase, create a PostgreSQL database and add its connection string as `DATABASE_URL` in Vercel. Use the provider's pooled connection URL when available and include SSL parameters required by that provider.

## 2. Configure and test locally

Requirements: Node.js 20.9 or newer and a PostgreSQL database.

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```dotenv
DATABASE_URL="postgresql://..."
EVENT_NAME="Your exact conference name"
ADMIN_PASSWORD="a-long-unique-team-password"
SESSION_SECRET="at-least-32-random-characters"
```

Generate strong values rather than reusing a personal password. One way to generate the session secret is:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Apply the schema and start the app:

```bash
npx prisma migrate deploy
npm run dev
```

Open `http://localhost:3000` for the attendee page and `http://localhost:3000/team` for the private lead desk. Submit a test lead, verify it appears in `/team`, edit its status/notes, and download the CSV before the event.

## 3. Deploy from GitHub to Vercel

1. In Vercel, select **Add New → Project** and import `bekzero/lead-tracker` from GitHub.
2. Keep **Framework Preset** set to Next.js and leave the root directory as the repository root.
3. Add these production environment variables under **Project Settings → Environment Variables**:
   - `DATABASE_URL` — hosted PostgreSQL connection string.
   - `EVENT_NAME` — event label stored with every submission.
   - `ADMIN_PASSWORD` — at least 12 characters; share only with authorized KZero staff.
   - `SESSION_SECRET` — at least 32 random characters.
4. Apply the same variables to Preview only if preview deployments should access a database. Prefer a separate preview database to avoid mixing test and production leads.
5. Deploy. The committed `vercel.json` tells Vercel to run `npm run vercel-build`, which verifies the required environment variables, generates Prisma Client, applies pending migrations, and builds Next.js.
6. Visit the production URL, submit a test entry, and confirm it in `/team`. Then export a CSV and open it in a spreadsheet.
7. Add a custom domain in **Project Settings → Domains** if desired. Use the final stable HTTPS URL for the QR code.

If the first deployment says `KZero deployment configuration is incomplete`, add every variable named in that message to the Production environment and redeploy. A deployment without `DATABASE_URL` is intentionally stopped so the public form cannot go live without working persistence.

Changing `EVENT_NAME` later affects new submissions only; each existing lead keeps the event name captured when it was submitted.

## 4. Generate and verify the booth QR code

After the final production URL is stable, run from this repository:

```bash
npm run qr -- https://your-final-public-url.example
```

This creates `public/kzero-lead-qr.png` with high error correction. The generated file is intentionally git-ignored so an obsolete URL is not accidentally deployed.

Before printing:

1. Scan the PNG from both iPhone and Android camera apps.
2. Confirm it opens the HTTPS attendee page directly—not `/team` and not a Vercel preview URL.
3. Print at least 35–40 mm wide with a clear white margin; do not crop, invert, stretch, or place it on a patterned background.
4. Test the final physical sign from the expected booth distance and on conference Wi-Fi/mobile data.
5. Keep the public URL stable for the full follow-up period.

## Conference-day checklist

- Submit and verify one live test lead before doors open.
- Sign in to `/team` on authorized staff devices and confirm CSV export works.
- Store the team password in KZero's approved password manager; do not put it on booth signage.
- Confirm `EVENT_NAME` is exact before collecting real leads.
- Export a backup CSV during and immediately after the event.
- If a submission temporarily fails, the form retains the attendee's entries and retrying uses the same idempotency key, preventing a repeat tap from creating another row.

## Data handling

The browser receives neither database credentials nor team secrets. Team sessions use a signed, HTTP-only, same-site cookie that expires after 12 hours. The attendee page has no route for reading leads. Restrict Vercel project/database access to authorized staff and follow KZero's retention and deletion policy after exporting the event data.
