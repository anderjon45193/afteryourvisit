# Changelog

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
