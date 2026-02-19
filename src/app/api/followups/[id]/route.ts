import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/followups/:id — Get follow-up details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const followUp = await prisma.followUp.findUnique({
    where: { id },
    include: {
      template: true,
      business: true,
    },
  });

  if (!followUp || followUp.businessId !== business!.id) {
    return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...followUp,
    templateName: followUp.template.name,
    business: {
      name: followUp.business.name,
      logoUrl: followUp.business.logoUrl,
      brandPrimaryColor: followUp.business.brandPrimaryColor,
      googleReviewUrl: followUp.business.googleReviewUrl,
      bookingUrl: followUp.business.bookingUrl,
    },
    status: followUp.reviewClickedAt
      ? "reviewed"
      : followUp.pageViewedAt
      ? "opened"
      : "sent",
  });
}
