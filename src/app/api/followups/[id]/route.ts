import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/followups/:id — Get follow-up details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const followUp = mockDb.getFollowUp(id);

  if (!followUp || followUp.businessId !== business.id) {
    return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
  }

  const template = mockDb.getTemplate(followUp.templateId);

  return NextResponse.json({
    ...followUp,
    templateName: template?.name || "Unknown",
    template,
    business: {
      name: business.name,
      logoUrl: business.logoUrl,
      brandPrimaryColor: business.brandPrimaryColor,
      googleReviewUrl: business.googleReviewUrl,
      bookingUrl: business.bookingUrl,
    },
    status: followUp.reviewClickedAt
      ? "reviewed"
      : followUp.pageViewedAt
      ? "opened"
      : "sent",
  });
}
