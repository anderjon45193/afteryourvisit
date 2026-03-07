# AfterYourVisit

Branded follow-up SMS messages for local service businesses (dentists, salons, veterinarians, auto shops, and more). After a client visit, send a personalized text with care instructions, review prompts, and booking links — all on a branded landing page.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Supabase) via Prisma ORM
- **Auth**: NextAuth.js v5 (email/password with bcrypt)
- **Payments**: Stripe (subscriptions at $29/$59/$99/month)
- **SMS**: Twilio
- **Email**: Resend
- **Styling**: Tailwind CSS 4, Radix UI, shadcn/ui

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

See `.env.example` for all required variables: database URLs, auth secret, Stripe keys, Twilio credentials, and app URL.

### 3. Set up the database

Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
  app/            # Next.js App Router pages and API routes
    api/          # REST API endpoints (auth, follow-ups, contacts, Stripe, Twilio)
    dashboard/    # Authenticated business dashboard
    visit/        # Public-facing follow-up landing pages
  components/     # React components (dashboard UI, shared, landing page)
  lib/            # Utilities (auth, Prisma client, Stripe, Twilio, phone normalization)
prisma/
  schema.prisma   # Database schema
```

## Deployment

The app is designed for deployment on Vercel with a Supabase PostgreSQL database. Set all environment variables from `.env.example` in your Vercel project settings.
