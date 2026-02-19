import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  // ─── 1. Create demo business ─────────────────────────────
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const demoBiz = await prisma.business.upsert({
    where: { email: "info@smiledentalcare.com" },
    update: {},
    create: {
      name: "Smile Dental Care",
      type: "dentist",
      email: "info@smiledentalcare.com",
      phone: "(555) 100-2000",
      brandPrimaryColor: "#0D9488",
      brandSecondaryColor: "#0F766E",
      googleReviewUrl: "https://g.page/r/smile-dental-care/review",
      websiteUrl: "https://smiledentalcare.com",
      bookingUrl: "https://calendly.com/smile-dental",
      plan: "starter",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      users: {
        create: {
          name: "Demo User",
          email: "demo@afteryourvisit.com",
          passwordHash,
          role: "owner",
        },
      },
    },
  });
  console.log(`✓ Demo business: ${demoBiz.name} (${demoBiz.id})`);

  // ─── 1b. Demo location ──────────────────────────────────
  const existingLocation = await prisma.location.findFirst({
    where: { businessId: demoBiz.id, name: "Main Office" },
  });
  if (!existingLocation) {
    const loc = await prisma.location.create({
      data: {
        name: "Main Office",
        address: "123 Smile Ave, Suite 100, Portland, OR 97201",
        phone: "(555) 100-2000",
        businessId: demoBiz.id,
      },
    });
    console.log(`✓ Demo location: ${loc.name} (${loc.id})`);
  } else {
    console.log(`⏭ Demo location already exists`);
  }

  // ─── 1c. Demo staff member ────────────────────────────────
  const staffHash = await bcrypt.hash("staff1234", 10);
  const existingStaff = await prisma.user.findUnique({
    where: { email: "alex@smiledentalcare.com" },
  });
  if (!existingStaff) {
    const staff = await prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: "alex@smiledentalcare.com",
        passwordHash: staffHash,
        role: "staff",
        businessId: demoBiz.id,
      },
    });
    console.log(`✓ Demo staff: ${staff.name} (${staff.id})`);
  } else {
    console.log(`⏭ Demo staff already exists`);
  }

  // ─── 2. System templates ─────────────────────────────────
  const systemTemplates = [
    {
      name: "Standard Cleaning",
      smsMessage:
        "Hi {{firstName}}! Thanks for visiting {{businessName}} today. Here's your visit summary: {{link}}",
      pageHeading: "Thanks for visiting, {{firstName}}!",
      pageSubheading: null,
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
        {
          type: "links",
          title: "Helpful Resources",
          links: [
            { label: "Brushing Technique Guide", url: "https://www.ada.org" },
            { label: "Patient Portal Login", url: "#" },
          ],
        },
      ],
      showReviewCta: true,
      showBookingCta: true,
      isDefault: true,
      isSystemTemplate: true,
      businessId: demoBiz.id,
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
        {
          type: "text",
          title: "What to Expect",
          content:
            "Some discomfort and swelling is normal for 2-3 days following the procedure. Over-the-counter pain medication should help manage any discomfort.",
        },
      ],
      showReviewCta: true,
      showBookingCta: true,
      isDefault: false,
      isSystemTemplate: true,
      businessId: demoBiz.id,
    },
    {
      name: "Orthodontics Check",
      smsMessage:
        "Hi {{firstName}}! Thanks for your ortho check-up at {{businessName}}. Here's what to know: {{link}}",
      pageHeading: "Ortho Update for {{firstName}}!",
      pageSubheading: null,
      sections: [
        { type: "notes", title: "Visit Notes", content: "{{customNotes}}" },
        {
          type: "checklist",
          title: "Reminders",
          items: [
            "Wear your retainer every night",
            "Avoid sticky and hard foods",
            "Brush after every meal",
            "Use orthodontic wax if brackets cause irritation",
          ],
        },
      ],
      showReviewCta: true,
      showBookingCta: true,
      isDefault: false,
      isSystemTemplate: true,
      businessId: demoBiz.id,
    },
  ];

  // Check if templates already exist
  const existingTemplates = await prisma.template.count({
    where: { isSystemTemplate: true, businessId: demoBiz.id },
  });

  let tplIds: string[] = [];
  if (existingTemplates === 0) {
    for (const tpl of systemTemplates) {
      const created = await prisma.template.create({ data: tpl });
      tplIds.push(created.id);
      console.log(`✓ Template: ${created.name} (${created.id})`);
    }
  } else {
    console.log(`⏭ System templates already exist (${existingTemplates})`);
    const existing = await prisma.template.findMany({
      where: { isSystemTemplate: true, businessId: demoBiz.id },
      select: { id: true },
    });
    tplIds = existing.map((t) => t.id);
  }

  // ─── 3. Demo contacts ────────────────────────────────────
  const existingContacts = await prisma.contact.count({
    where: { businessId: demoBiz.id },
  });

  const contactIds: string[] = [];
  if (existingContacts === 0) {
    const contacts = [
      { firstName: "Sarah", lastName: "Johnson", phone: "(555) 123-4567", email: "sarah.j@email.com", tags: ["recurring"], source: "manual", totalFollowUps: 1, hasLeftReview: true, notes: "Preferred morning appointments" },
      { firstName: "Nicole", lastName: "Chen", phone: "(555) 111-2233", email: "nicole.c@email.com", tags: ["new-patient"], source: "csv_import", totalFollowUps: 1, hasLeftReview: false, notes: null },
      { firstName: "Kevin", lastName: "Park", phone: "(555) 222-3344", email: "kevin.p@email.com", tags: ["recurring"], source: "manual", totalFollowUps: 1, hasLeftReview: true, notes: "Nervous patient — extra care needed" },
      { firstName: "Priya", lastName: "Sharma", phone: "(555) 333-4455", email: "priya.s@email.com", tags: ["recurring", "vip"], source: "manual", totalFollowUps: 1, hasLeftReview: false, notes: null },
      { firstName: "Marcus", lastName: "Williams", phone: "(555) 444-5566", email: null, tags: ["new-patient"], source: "auto_saved", totalFollowUps: 1, hasLeftReview: false, notes: "Implant candidate" },
      { firstName: "Olivia", lastName: "Martinez", phone: "(555) 555-6677", email: "olivia.m@email.com", tags: ["recurring"], source: "csv_import", totalFollowUps: 1, hasLeftReview: true, notes: null },
      { firstName: "Amy", lastName: "Taylor", phone: "(555) 789-0123", email: "amy.t@email.com", tags: ["vip"], source: "manual", totalFollowUps: 1, hasLeftReview: true, notes: null },
      { firstName: "Tom", lastName: "Baker", phone: "(555) 890-1234", email: null, tags: [], source: "auto_saved", totalFollowUps: 1, hasLeftReview: false, notes: null, optedOut: true },
      { firstName: "Rachel", lastName: "Kim", phone: "(555) 901-2345", email: "rachel.k@email.com", tags: ["recurring"], source: "manual", totalFollowUps: 1, hasLeftReview: true, notes: null },
      { firstName: "Chris", lastName: "Davis", phone: "(555) 012-3456", email: "chris.d@email.com", tags: ["new-patient"], source: "csv_import", totalFollowUps: 1, hasLeftReview: false, notes: null, optedOut: true },
    ];

    for (const c of contacts) {
      const created = await prisma.contact.create({
        data: {
          ...c,
          optedOut: c.optedOut || false,
          businessId: demoBiz.id,
          lastFollowUpAt: new Date(),
        },
      });
      contactIds.push(created.id);
    }
    console.log(`✓ ${contacts.length} demo contacts created`);
  } else {
    console.log(`⏭ Contacts already exist (${existingContacts})`);
    const existing = await prisma.contact.findMany({
      where: { businessId: demoBiz.id },
      select: { id: true },
      take: 10,
    });
    contactIds.push(...existing.map((c) => c.id));
  }

  // ─── 4. Demo follow-ups ──────────────────────────────────
  const existingFollowUps = await prisma.followUp.count({
    where: { businessId: demoBiz.id },
  });

  if (existingFollowUps === 0 && tplIds.length >= 3) {
    const followUps = [
      {
        clientFirstName: "Sarah",
        clientPhone: "(555) 123-4567",
        customNotes: "Routine cleaning completed. No cavities found! Continue flossing daily.",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-18T14:45:00.000Z"),
        reviewClickedAt: new Date("2026-02-18T14:47:00.000Z"),
        templateId: tplIds[0],
        contactId: contactIds[0] || null,
        createdAt: new Date("2026-02-18T14:30:00.000Z"),
      },
      {
        clientFirstName: "Nicole",
        clientPhone: "(555) 111-2233",
        customNotes: "Teeth whitening completed — 4 shades brighter. Avoid dark beverages for 48 hours.",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-18T16:00:00.000Z"),
        templateId: tplIds[0],
        contactId: contactIds[1] || null,
        createdAt: new Date("2026-02-18T15:30:00.000Z"),
      },
      {
        clientFirstName: "Kevin",
        clientPhone: "(555) 222-3344",
        customNotes: "Root canal on tooth #19. Temporary filling placed. Return in 2 weeks for permanent crown.",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-18T13:00:00.000Z"),
        reviewClickedAt: new Date("2026-02-18T13:05:00.000Z"),
        templateId: tplIds[1],
        contactId: contactIds[2] || null,
        createdAt: new Date("2026-02-18T12:30:00.000Z"),
      },
      {
        clientFirstName: "Amy",
        clientPhone: "(555) 789-0123",
        customNotes: "Crown prep on #30. Temporary crown placed. Permanent crown ready in 2 weeks.",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-16T15:30:00.000Z"),
        reviewClickedAt: new Date("2026-02-16T15:35:00.000Z"),
        templateId: tplIds[1],
        contactId: contactIds[6] || null,
        createdAt: new Date("2026-02-16T15:15:00.000Z"),
      },
      {
        clientFirstName: "Rachel",
        clientPhone: "(555) 901-2345",
        customNotes: "Retainer check. Teeth look great, continue wearing retainer nightly.",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-15T11:30:00.000Z"),
        reviewClickedAt: new Date("2026-02-15T11:32:00.000Z"),
        bookingClickedAt: new Date("2026-02-15T11:33:00.000Z"),
        templateId: tplIds[2],
        contactId: contactIds[8] || null,
        createdAt: new Date("2026-02-15T11:00:00.000Z"),
      },
      {
        clientFirstName: "Chris",
        clientPhone: "(555) 012-3456",
        customNotes: "Routine cleaning. Recommended electric toothbrush.",
        smsStatus: "delivered",
        templateId: tplIds[0],
        contactId: contactIds[9] || null,
        createdAt: new Date("2026-02-15T09:30:00.000Z"),
      },
      {
        clientFirstName: "Priya",
        clientPhone: "(555) 333-4455",
        customNotes: "Periodontal maintenance. Gum health improved — pocket depths reduced from 5mm to 3mm.",
        smsStatus: "delivered",
        templateId: tplIds[0],
        contactId: contactIds[3] || null,
        createdAt: new Date("2026-02-17T15:00:00.000Z"),
      },
      {
        clientFirstName: "Marcus",
        clientPhone: "(555) 444-5566",
        customNotes: "Dental implant consultation for missing #8. Treatment plan provided.",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-17T11:30:00.000Z"),
        bookingClickedAt: new Date("2026-02-17T11:35:00.000Z"),
        templateId: tplIds[1],
        contactId: contactIds[4] || null,
        createdAt: new Date("2026-02-17T11:00:00.000Z"),
      },
      {
        clientFirstName: "Tom",
        clientPhone: "(555) 890-1234",
        customNotes: "Routine cleaning and fluoride treatment.",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-16T14:00:00.000Z"),
        templateId: tplIds[0],
        contactId: contactIds[7] || null,
        createdAt: new Date("2026-02-16T13:45:00.000Z"),
      },
      {
        clientFirstName: "Olivia",
        clientPhone: "(555) 555-6677",
        customNotes: "Child's first dental visit (age 3). All 20 primary teeth present and healthy!",
        smsStatus: "delivered",
        pageViewedAt: new Date("2026-02-16T10:30:00.000Z"),
        reviewClickedAt: new Date("2026-02-16T10:33:00.000Z"),
        templateId: tplIds[0],
        contactId: contactIds[5] || null,
        createdAt: new Date("2026-02-16T10:00:00.000Z"),
      },
    ];

    for (const fu of followUps) {
      await prisma.followUp.create({
        data: {
          ...fu,
          businessId: demoBiz.id,
        },
      });
    }
    console.log(`✓ ${followUps.length} demo follow-ups created`);
  } else if (existingFollowUps > 0) {
    console.log(`⏭ Follow-ups already exist (${existingFollowUps})`);
  }

  // ─── 5. Demo snippets ────────────────────────────────────
  const existingSnippets = await prisma.snippet.count({
    where: { businessId: demoBiz.id },
  });

  if (existingSnippets === 0) {
    const snippets = [
      { label: "Take ibuprofen as needed for 3 days", category: "aftercare" },
      { label: "Soft foods only for 24 hours", category: "aftercare" },
      { label: "Call if pain persists beyond 48 hours", category: "aftercare" },
      { label: "Avoid hot/cold foods today", category: "aftercare" },
      { label: "Floss gently around the treated area", category: "aftercare" },
      { label: "Rinse with warm salt water tonight", category: "aftercare" },
      { label: "Schedule next visit in 6 months", category: "scheduling" },
      { label: "Wear retainer every night", category: "aftercare" },
      { label: "Use prescribed mouthwash twice daily", category: "aftercare" },
    ];

    for (const s of snippets) {
      await prisma.snippet.create({
        data: {
          label: s.label,
          text: s.label,
          category: s.category,
          businessId: demoBiz.id,
        },
      });
    }
    console.log(`✓ ${snippets.length} demo snippets created`);
  } else {
    console.log(`⏭ Snippets already exist (${existingSnippets})`);
  }

  console.log("\n✓ Seed complete!");
  console.log(`\nDemo login: demo@afteryourvisit.com / demo1234`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
