import { NextResponse } from "next/server";
import { extractBranding } from "@/lib/auto-brand";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  // Validate it's a real URL
  new URL(url);
  return url;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url: rawUrl, persist } = body as {
      url: string;
      persist?: boolean;
    };

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    let url: string;
    try {
      url = normalizeUrl(rawUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    const result = await extractBranding(url);

    if (persist) {
      // Auth required for persist mode
      const { error, business } = await getAuthenticatedBusiness();
      if (error) return error;

      const updateData: Record<string, unknown> = {
        autoBrandFetched: true,
        autoBrandData: result,
      };
      if (result.logo?.value) updateData.logoUrl = result.logo.value;
      if (result.primaryColor?.value)
        updateData.brandPrimaryColor = result.primaryColor.value;
      if (result.secondaryColor?.value)
        updateData.brandSecondaryColor = result.secondaryColor.value;
      if (result.phone?.value) updateData.phone = result.phone.value;
      if (result.googleReviewUrl?.value)
        updateData.googleReviewUrl = result.googleReviewUrl.value;

      await prisma.business.update({
        where: { id: business!.id },
        data: updateData,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Auto-brand error:", error);
    return NextResponse.json(
      { error: "Failed to extract branding" },
      { status: 500 }
    );
  }
}
