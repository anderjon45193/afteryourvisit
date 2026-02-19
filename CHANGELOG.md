# Changelog

## 2026-02-19 — Bulk Follow-Up Send & Annual Billing (Phase 2a)

### New Features

#### Bulk Follow-Up Send
Select multiple contacts from the Contacts page and send follow-ups to all of them at once.

- **API** — New `POST /api/followups/bulk` route accepting `contactIds`, `templateId`, and optional `customNotes`
  - Authenticates and validates template ownership
  - Loads contacts filtered by businessId (security)
  - Automatically skips opted-out contacts (checks OptOut table)
  - Creates FollowUp record per contact, sends SMS via Twilio, updates contact stats
  - 2-second stagger between SMS sends to respect rate limits
  - Returns summary: `{ sent, failed, skippedOptOut, results }`
- **UI** — New "Send Follow-Up" button in the bulk action bar on the Contacts page
  - Slide-over modal with template dropdown (auto-selects default template)
  - Optional notes textarea applied to all follow-ups
  - Summary line showing count and selected template name
  - Loading state during send
  - Results view with sent/failed/skipped counts and contextual messages
  - On completion, clears selection and refreshes contact list

#### Annual Billing Toggle (Settings Page)
Users can now switch between Monthly and Annual billing when upgrading their plan from the dashboard.

- Pill-style Monthly/Annual toggle above upgrade plan cards (matches landing page design)
- Prices update dynamically to show annual rates with a "Save 20%" badge
- Shows annual total below price (e.g. "Billed $564/year")
- `handleUpgrade` passes the selected interval to the Stripe checkout API

### Changed

- Settings page now imports plan data from the shared `PLANS` config in `src/lib/stripe.ts` instead of a local `PLAN_DETAILS` object, eliminating price duplication

### Files Changed

| Action | File |
|--------|------|
| Created | `src/app/api/followups/bulk/route.ts` |
| Modified | `src/app/dashboard/settings/page.tsx` |
| Modified | `src/app/dashboard/contacts/page.tsx` |

### Phase 2 Checklist Updates

- [x] Bulk follow-up send
- [x] Annual billing toggle

---

## 2026-02-19 — Real Data Wiring, Auto-Branding & Security (Session 3)

### Dashboard, Analytics, Snippets — Wired to Real Data

All three remaining mock-data pages now call real API routes backed by Prisma queries.

- **Dashboard home** (`/dashboard`) — Stats from `/api/analytics/overview`, recent follow-ups from `/api/followups?limit=6`. Loading skeletons. Empty state with "Send Your First Follow-Up" CTA.
- **Analytics** (`/dashboard/analytics`) — Summary stats + trends from `/api/analytics/overview`, weekly bar chart from `/api/analytics/timeline`, funnel computed from real counts. Full loading state.
- **Snippets** (`/dashboard/snippets`) — Full CRUD via `/api/snippets` and `/api/snippets/[id]`. Category picker on create form. Loading states on fetch, add, delete.

### Auto-Branding Engine (New Feature)

Server-side website scraping engine that auto-extracts branding from a business URL. The single highest-impact onboarding feature from the spec (Section 5b).

**Files created:**
- `src/lib/auto-brand-types.ts` — Shared `AutoBrandResult` interface with per-field confidence scores
- `src/lib/auto-brand.ts` — Extraction engine using cheerio:
  - Logo: apple-touch-icon > og:image > header/nav logo img > favicon
  - Colors: meta theme-color > CSS custom properties > inline style colors
  - Business name: JSON-LD LocalBusiness/Organization > og:site_name > og:title > title tag
  - Phone: JSON-LD telephone > tel: links
  - Google Review URL: google.com/maps, g.page, writereview links
  - Helpers: `isValidHex`, `normalizeHex`, `darkenHex`, `isNeutral`
- `src/app/api/business/auto-brand/route.ts` — `POST /api/business/auto-brand`
  - Without `persist`: returns extracted data only (no auth required, used during sign-up)
  - With `persist: true`: requires auth, updates business record in DB
  - URL normalization (adds https://), 10s fetch timeout, 500KB body limit

**Sign-up page** (`src/app/sign-up/page.tsx`) — 3-step wizard becomes 4-step:
- Step 2 now includes a Website URL field with Globe icon
- New Step 3 "Your Brand" with Sparkles icon:
  - Auto-fires branding extraction on step enter
  - Animated skeleton while loading
  - Logo preview, native `<input type="color">` pickers with hex text inputs
  - Detected phone and Google Review URL summary card
  - Graceful failure: "We couldn't detect everything" with manual fallback
- Step 3 skipped entirely if no website URL entered (jumps 2 → 4)
- Step 4 pre-fills Google Review URL from auto-detection
- Registration payload sends: `websiteUrl`, `logoUrl`, `brandPrimaryColor`, `brandSecondaryColor`, `autoBrandFetched`, `autoBrandData`

**Register API** (`src/app/api/auth/register/route.ts`) — Now accepts and stores branding fields.

**Dependency added:** `cheerio` (server-side HTML parser)

### Settings Page Bug Fixes

- **Brand colors not saving** — Added `brandPrimaryColor`, `brandSecondaryColor`, `logoUrl` to `handleProfileSave` request body
- **Business API whitelist** — Added `brandPrimaryColor`, `brandSecondaryColor`, `logoUrl` to allowed PUT fields in `/api/business`
- **Non-functional color swatches** — Replaced static `<div>` color previews with native `<input type="color">` pickers + hex text inputs
- **Logo display** — Shows actual logo image from `business.logoUrl` instead of always showing initials fallback
- **Auto-detect button** — New "Auto-detect branding from website" button below Website input (calls `/api/business/auto-brand` with `persist: true`, refreshes all form fields)

### Database Security — RLS Enabled

Applied migration `20260219142555_rls_and_missing_indexes`:
- Enabled Row Level Security on all 11 app tables (Business, User, Contact, FollowUp, Location, Template, Snippet, OptOut, ImportJob, Integration, Lead)
- Enabled RLS on `_prisma_migrations` via `prisma db execute`
- No RLS policies added — Supabase anon/authenticated keys are now fully blocked from REST/GraphQL API access. Prisma uses the postgres superuser role which bypasses RLS.

### Missing Index Fix

Same migration added 3 missing FK indexes flagged by Supabase Performance Advisor:
- `FollowUp.locationId` — `@@index([locationId])`
- `FollowUp.templateId` — `@@index([templateId])`
- `Integration.businessId` — `@@index([businessId])`

### Files Changed

| Action | File |
|--------|------|
| Created | `src/lib/auto-brand-types.ts` |
| Created | `src/lib/auto-brand.ts` |
| Created | `src/app/api/business/auto-brand/route.ts` |
| Created | `prisma/migrations/20260219142555_rls_and_missing_indexes/migration.sql` |
| Modified | `src/app/sign-up/page.tsx` |
| Modified | `src/app/dashboard/settings/page.tsx` |
| Modified | `src/app/dashboard/page.tsx` |
| Modified | `src/app/dashboard/analytics/page.tsx` |
| Modified | `src/app/dashboard/snippets/page.tsx` |
| Modified | `src/app/api/auth/register/route.ts` |
| Modified | `src/app/api/business/route.ts` |
| Modified | `prisma/schema.prisma` |

---

## Phase 1 MVP Status: Complete

Every item from the spec's Phase 1 checklist is built and wired to the real database:

- [x] Landing page with email capture
- [x] Sign up / login (NextAuth.js v5)
- [x] Business onboarding wizard with website auto-branding
- [x] Contacts system (CSV import, search, filters, auto-save, autocomplete)
- [x] 3+ pre-built templates with full CRUD editor
- [x] Send Follow-Up with contact autocomplete, snippets, SMS preview
- [x] Client follow-up page (branded, tracked, mobile-first)
- [x] Twilio SMS integration (with dev-mode mock)
- [x] Stripe subscriptions (checkout, webhooks, portal)
- [x] Dashboard with real stats + recent follow-ups
- [x] Analytics with real charts + funnel
- [x] Snippets with real CRUD
- [x] Opt-out / STOP handling
- [x] RLS enabled on all tables

---

## What Remains — Phase 2+ Features

Roughly ordered by impact. None of these block a production launch.

### Phase 2 — Growth Features

- [x] **Bulk follow-up send** — Select multiple contacts, choose template, optional per-client notes, send all with Twilio rate-limiting stagger
- [ ] **Template editor live preview** — Split-screen with phone mockup on right, real-time updates
- [ ] **Contact detail drawer improvements** — Full follow-up history timeline with status, activity log (page views, review clicks, booking clicks)
- [ ] **Contact tags and bulk actions** — Bulk tag add/remove, bulk send from contacts page
- [x] **Annual billing toggle** — Pricing page and Stripe checkout support for annual interval (20% discount)
- [ ] **Multiple locations** — Location CRUD in settings, assign Twilio numbers per location, location selector in send flow
- [ ] **Team member invites** — Invite by email, role management (owner/admin/staff), team settings tab
- [ ] **Google Contacts OAuth** — OAuth flow, import contacts, auto-sync
- [ ] **Zapier integration** — Inbound webhook (create contact / trigger follow-up), API key management
- [ ] **Logo file upload** — Wire "Upload Logo" button to file storage (S3 or Cloudflare R2), update `business.logoUrl`

### Phase 3 — Scale

- [ ] **API access** — Public API for Pro plan customers
- [ ] **Square Appointments integration** — Auto-send follow-ups after Square appointments
- [ ] **Practice management integrations** — Dentrix, Open Dental, Eaglesoft
- [ ] **Google Business Profile API** — Pull review count automatically
- [ ] **Automated follow-up scheduling** — Send X hours after appointment via integration trigger
- [ ] **White-label option** — Remove AfterYourVisit branding for agencies

### Polish / Nice-to-Have

- [ ] **Transactional email** — Onboarding welcome, receipts (Resend or SendGrid)
- [ ] **Error monitoring** — Sentry integration
- [ ] **Product analytics** — PostHog or Mixpanel
- [ ] **Contact export** — CSV export from contacts page
- [ ] **Contact history endpoint** — `GET /api/contacts/:id/history`
- [ ] **Bulk tag endpoint** — `POST /api/contacts/bulk-tag`
- [ ] **Follow-up stats endpoint** — `GET /api/followups/:id/stats`
- [ ] **Industry template endpoint** — `GET /api/templates/industry/:type`
- [ ] **Google Business connect endpoint** — `POST /api/business/google`

---

## 2026-02-19 — Contacts, Integrations & Autocomplete (MVP Phase 1)

### New Features

#### Contacts System
- **Contacts Dashboard Page** (`/dashboard/contacts`)
  - Searchable, filterable contact table (desktop) and card list (mobile)
  - Filter pills: All, Has Review, No Review, Opted Out
  - Contact detail drawer with editable fields, follow-up history timeline, and activity stats
  - "Add Contact" sheet with form validation and duplicate phone detection
  - CSV Import (multi-step): file upload → column auto-mapping → processing → results summary
  - Bulk selection with fixed bottom action bar for bulk delete
  - Pagination controls
  - Empty state with CTA buttons

#### Contact Autocomplete on Send Page
- Typing 2+ characters in the "Client First Name" field shows a debounced dropdown of matching contacts
- Selecting a suggestion auto-fills the name and phone number
- "Add as new contact" option to dismiss and continue manually
- Pre-fill support via `?contactId=` query parameter (e.g., from contact detail drawer)

#### Auto-Save Contacts on Follow-Up Send
- Sending a follow-up to a new phone number automatically creates a contact (`source: "auto_saved"`)
- Sending to an existing contact increments their follow-up count and updates `lastFollowUpAt`
- Follow-ups are linked to contacts via `contactId`

#### Integrations Page (`/dashboard/integrations`)
- Card grid with 5 integrations:
  - **CSV Import** (active) — links to contacts page import flow
  - **Google Contacts** — Coming Soon
  - **Zapier** — Coming Soon
  - **Square Appointments** — Coming Soon
  - **Practice Management** — Coming Soon

### API Routes Added
- `GET/POST /api/contacts` — List (paginated, searchable, filterable) and create contacts
- `GET/PUT/DELETE /api/contacts/[id]` — Single contact with follow-up history, update, delete
- `GET /api/contacts/search?q=` — Autocomplete search (top 5 non-opted-out matches)
- `POST /api/contacts/import` — CSV import with duplicate detection and phone normalization
- `POST /api/contacts/bulk` — Bulk delete or tag operations

### Data Model Changes (`src/lib/mock-data.ts`)
- Added `Contact` interface (firstName, lastName, phone, email, tags, source, totalFollowUps, lastFollowUpAt, hasLeftReview, notes, optedOut, businessId)
- Added `ImportJob` interface for tracking CSV imports
- Added `contactId: string | null` to `FollowUp` interface
- Seeded 10 contacts for demo business, linked to existing follow-up records
- Added helper methods: `getContacts`, `getContact`, `findContactByPhone`, `searchContacts`, `getContactFollowUps`

### Navigation Updates
- **Sidebar** — Added "Contacts" (between Follow-Ups and Templates) and "Integrations" (before Settings)
- **Mobile bottom nav** — Replaced "Templates" with "Contacts"
- **Mobile hamburger menu** — Added "Contacts" and "Integrations" links

### Files Changed
| Action | File |
|--------|------|
| Modified | `src/lib/mock-data.ts` |
| Modified | `src/app/api/followups/route.ts` |
| Modified | `src/app/dashboard/send/page.tsx` |
| Modified | `src/components/dashboard/sidebar.tsx` |
| Modified | `src/components/dashboard/mobile-nav.tsx` |
| Modified | `src/components/dashboard/dashboard-header.tsx` |
| Created | `src/app/api/contacts/route.ts` |
| Created | `src/app/api/contacts/[id]/route.ts` |
| Created | `src/app/api/contacts/search/route.ts` |
| Created | `src/app/api/contacts/import/route.ts` |
| Created | `src/app/api/contacts/bulk/route.ts` |
| Created | `src/app/dashboard/contacts/page.tsx` |
| Created | `src/app/dashboard/integrations/page.tsx` |
