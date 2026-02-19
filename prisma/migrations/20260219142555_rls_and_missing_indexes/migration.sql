-- CreateIndex
CREATE INDEX "FollowUp_locationId_idx" ON "FollowUp"("locationId");

-- CreateIndex
CREATE INDEX "FollowUp_templateId_idx" ON "FollowUp"("templateId");

-- CreateIndex
CREATE INDEX "Integration_businessId_idx" ON "Integration"("businessId");

-- Enable Row Level Security on all tables.
-- Since all data access goes through Prisma (server-side, using the postgres role),
-- enabling RLS with no policies blocks the public anon/authenticated keys from
-- reading or writing data via the Supabase REST/GraphQL API.
ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FollowUp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Snippet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OptOut" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImportJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;

-- _prisma_migrations RLS is applied separately via SQL editor since the shadow
-- database doesn't have this table during migrate dev validation.
-- Run manually: ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
