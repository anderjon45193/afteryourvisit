import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.register, "register");
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const {
      name, email, password, businessName, businessType, businessPhone,
      googleReviewUrl, bookingUrl, websiteUrl,
      logoUrl, brandPrimaryColor, brandSecondaryColor,
      autoBrandFetched, autoBrandData,
    } = body;

    // Validation
    if (!name || !email || !password || !businessName || !businessType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create business with owner user in a single transaction
    const business = await prisma.business.create({
      data: {
        name: businessName,
        type: businessType,
        email,
        phone: businessPhone || null,
        websiteUrl: websiteUrl || null,
        googleReviewUrl: googleReviewUrl || null,
        bookingUrl: bookingUrl || null,
        logoUrl: logoUrl || null,
        brandPrimaryColor: brandPrimaryColor || "#0D9488",
        brandSecondaryColor: brandSecondaryColor || "#0F766E",
        autoBrandFetched: autoBrandFetched || false,
        autoBrandData: autoBrandData || undefined,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        users: {
          create: {
            name,
            email,
            passwordHash,
            role: "owner",
          },
        },
      },
    });

    // Create starter templates based on business type
    const starterTemplates = getStarterTemplates(businessType, business.id);
    for (const tpl of starterTemplates) {
      await prisma.template.create({ data: tpl });
    }

    return NextResponse.json({ success: true, businessId: business.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getStarterTemplates(businessType: string, businessId: string) {
  const base = {
    smsMessage:
      "Hi {{firstName}}! Thanks for visiting {{businessName}} today. Here's your visit summary: {{link}}",
    pageHeading: "Thanks for visiting, {{firstName}}!",
    pageSubheading: null as string | null,
    showReviewCta: true,
    showBookingCta: true,
    isDefault: true,
    isSystemTemplate: true,
    businessId,
  };

  const industryTemplates: Record<string, Array<{
    name: string;
    smsMessage?: string;
    pageHeading?: string;
    pageSubheading?: string | null;
    sections: Prisma.InputJsonValue;
    isDefault: boolean;
  }>> = {
    dentist: [
      {
        name: "Standard Cleaning",
        sections: [
          { type: "notes", title: "Your Visit Notes", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Things to Remember",
            items: [
              "Brush twice daily with fluoride toothpaste",
              "Floss every evening before bed",
              "Avoid very hot/cold foods for 24 hours",
              "Schedule your next visit in 6 months",
            ],
          },
        ],
        isDefault: true,
      },
      {
        name: "Post-Procedure",
        smsMessage:
          "Hi {{firstName}}! Here are your post-procedure care instructions from {{businessName}}: {{link}}",
        pageHeading: "Post-Procedure Care for {{firstName}}",
        pageSubheading: "Please review these instructions carefully",
        sections: [
          { type: "notes", title: "Procedure Notes", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Aftercare Instructions",
            items: [
              "Take prescribed medication as directed",
              "Apply ice packs for 20 minutes on, 20 minutes off",
              "Eat soft foods for the first 48 hours",
              "Avoid strenuous activity for 24 hours",
              "Call us immediately if you experience excessive bleeding",
            ],
          },
        ],
        isDefault: false,
      },
    ],
    vet: [
      {
        name: "Standard Visit",
        sections: [
          { type: "notes", title: "Visit Notes", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Care Reminders",
            items: [
              "Administer medications as prescribed",
              "Monitor for any changes in behavior or appetite",
              "Keep activity level low for 24 hours if sedated",
              "Schedule next checkup as recommended",
            ],
          },
        ],
        isDefault: true,
      },
      {
        name: "Post-Surgery",
        smsMessage:
          "Hi {{firstName}}! Here are the post-surgery care instructions from {{businessName}}: {{link}}",
        pageHeading: "Post-Surgery Care Instructions",
        pageSubheading: "Please follow these instructions carefully for a smooth recovery",
        sections: [
          { type: "notes", title: "Surgery Notes", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Recovery Instructions",
            items: [
              "Keep your pet calm and restrict activity for 10-14 days",
              "Check the incision site daily for swelling or discharge",
              "Use the cone/e-collar to prevent licking",
              "Give medications exactly as prescribed",
              "No baths or swimming until sutures are removed",
              "Call us if you notice anything unusual",
            ],
          },
        ],
        isDefault: false,
      },
    ],
    mechanic: [
      {
        name: "Service Complete",
        smsMessage:
          "Hi {{firstName}}! Your vehicle service at {{businessName}} is complete. Here's your summary: {{link}}",
        pageHeading: "Service Summary for {{firstName}}",
        sections: [
          { type: "notes", title: "Service Performed", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Recommended Next Steps",
            items: [
              "Check tire pressure monthly",
              "Next oil change due in 5,000 miles",
              "Monitor any warning lights",
              "Schedule next service as recommended",
            ],
          },
        ],
        isDefault: true,
      },
    ],
    salon: [
      {
        name: "Appointment Follow-Up",
        sections: [
          { type: "notes", title: "Service Notes", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Aftercare Tips",
            items: [
              "Wait 48 hours before washing hair (if colored)",
              "Use recommended products for best results",
              "Book your next appointment in 6-8 weeks",
              "Share your new look on social media and tag us!",
            ],
          },
        ],
        isDefault: true,
      },
    ],
    chiro: [
      {
        name: "Adjustment Follow-Up",
        sections: [
          { type: "notes", title: "Visit Notes", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Post-Visit Care",
            items: [
              "Drink plenty of water today",
              "Apply ice if you feel any soreness (20 min on, 20 min off)",
              "Do the prescribed stretches daily",
              "Avoid heavy lifting for 24 hours",
              "Follow up at your next scheduled visit",
            ],
          },
        ],
        isDefault: true,
      },
    ],
    medical: [
      {
        name: "Visit Follow-Up",
        sections: [
          { type: "notes", title: "Visit Notes", content: "{{customNotes}}" },
          {
            type: "checklist",
            title: "Next Steps",
            items: [
              "Take medications as prescribed",
              "Follow up if symptoms persist or worsen",
              "Schedule any recommended lab work or imaging",
              "Book your next appointment as discussed",
            ],
          },
        ],
        isDefault: true,
      },
    ],
  };

  // Generic fallback for "other" or unknown types
  const genericTemplates = [
    {
      name: "Standard Follow-Up",
      sections: [
        { type: "notes", title: "Visit Notes", content: "{{customNotes}}" },
        {
          type: "checklist",
          title: "Next Steps",
          items: [
            "Follow up if you have any questions",
            "Schedule your next appointment",
          ],
        },
      ],
      isDefault: true,
    },
  ];

  const templates = industryTemplates[businessType] || genericTemplates;

  return templates.map((tpl) => ({
    ...base,
    ...tpl,
    sections: tpl.sections,
    pageSubheading: tpl.pageSubheading ?? null,
  }));
}
