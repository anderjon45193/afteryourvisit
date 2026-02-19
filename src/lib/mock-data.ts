// In-memory mock database that mirrors Prisma models.
// Replace with real Prisma queries when DATABASE_URL is configured.

export interface Business {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string | null;
  logoUrl: string | null;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  googlePlaceId: string | null;
  googleReviewUrl: string | null;
  websiteUrl: string | null;
  bookingUrl: string | null;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubId: string | null;
  trialEndsAt: string | null;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  smsMessage: string;
  pageHeading: string;
  pageSubheading: string | null;
  sections: Section[];
  showReviewCta: boolean;
  showBookingCta: boolean;
  isDefault: boolean;
  isSystemTemplate: boolean;
  businessId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  type: "notes" | "checklist" | "links" | "text";
  title: string;
  content?: string;
  items?: string[];
  links?: { label: string; url: string }[];
}

export interface FollowUp {
  id: string;
  clientFirstName: string;
  clientPhone: string;
  customNotes: string | null;
  smsStatus: string;
  smsSid: string | null;
  pageViewedAt: string | null;
  reviewClickedAt: string | null;
  bookingClickedAt: string | null;
  templateId: string;
  businessId: string;
  locationId: string | null;
  contactId: string | null;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  tags: string[];
  source: "manual" | "csv_import" | "auto_saved";
  totalFollowUps: number;
  lastFollowUpAt: string | null;
  hasLeftReview: boolean;
  notes: string | null;
  optedOut: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportJob {
  id: string;
  source: string;
  status: "processing" | "completed" | "failed";
  fileName: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errorDetails: string[];
  businessId: string;
  createdAt: string;
  completedAt: string | null;
}

export interface Snippet {
  id: string;
  label: string;
  text: string;
  category: string | null;
  businessId: string;
  createdAt: string;
}

export interface OptOut {
  id: string;
  phone: string; // E.164 format
  businessId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  email: string;
  createdAt: string;
}

// ─── Seed Data ────────────────────────────────────────────

const BUSINESS_ID = "demo-biz-1";

const business: Business = {
  id: BUSINESS_ID,
  name: "Smile Dental Care",
  type: "dentist",
  email: "info@smiledentalcare.com",
  phone: "(555) 100-2000",
  logoUrl: null,
  brandPrimaryColor: "#0D9488",
  brandSecondaryColor: "#0F766E",
  googlePlaceId: null,
  googleReviewUrl: "https://g.page/r/smile-dental-care/review",
  websiteUrl: "https://smiledentalcare.com",
  bookingUrl: "https://calendly.com/smile-dental",
  plan: "starter",
  stripeCustomerId: null,
  stripeSubId: null,
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: "2026-02-01T00:00:00.000Z",
};

const vetBiz: Business = {
  id: "demo-biz-2",
  name: "Paws & Claws Animal Hospital",
  type: "veterinarian",
  email: "info@pawsandclaws.com",
  phone: "(555) 200-3000",
  logoUrl: null,
  brandPrimaryColor: "#D97706",
  brandSecondaryColor: "#B45309",
  googlePlaceId: null,
  googleReviewUrl: "https://g.page/r/paws-claws/review",
  websiteUrl: "https://pawsandclaws.com",
  bookingUrl: "https://calendly.com/paws-claws",
  plan: "starter",
  stripeCustomerId: null,
  stripeSubId: null,
  trialEndsAt: null,
  createdAt: "2026-02-01T00:00:00.000Z",
};

const salonBiz: Business = {
  id: "demo-biz-3",
  name: "Glow Studio Salon & Spa",
  type: "salon",
  email: "hello@glowstudio.com",
  phone: "(555) 300-4000",
  logoUrl: null,
  brandPrimaryColor: "#BE185D",
  brandSecondaryColor: "#9D174D",
  googlePlaceId: null,
  googleReviewUrl: "https://g.page/r/glow-studio/review",
  websiteUrl: "https://glowstudio.com",
  bookingUrl: "https://calendly.com/glow-studio",
  plan: "starter",
  stripeCustomerId: null,
  stripeSubId: null,
  trialEndsAt: null,
  createdAt: "2026-02-01T00:00:00.000Z",
};

const autoBiz: Business = {
  id: "demo-biz-4",
  name: "Precision Auto Works",
  type: "auto_mechanic",
  email: "service@precisionauto.com",
  phone: "(555) 400-5000",
  logoUrl: null,
  brandPrimaryColor: "#1D4ED8",
  brandSecondaryColor: "#1E40AF",
  googlePlaceId: null,
  googleReviewUrl: "https://g.page/r/precision-auto/review",
  websiteUrl: "https://precisionautoworks.com",
  bookingUrl: "https://calendly.com/precision-auto",
  plan: "starter",
  stripeCustomerId: null,
  stripeSubId: null,
  trialEndsAt: null,
  createdAt: "2026-02-01T00:00:00.000Z",
};

const chiroBiz: Business = {
  id: "demo-biz-5",
  name: "Back in Balance Chiropractic",
  type: "chiropractor",
  email: "info@backinbalance.com",
  phone: "(555) 500-6000",
  logoUrl: null,
  brandPrimaryColor: "#059669",
  brandSecondaryColor: "#047857",
  googlePlaceId: null,
  googleReviewUrl: "https://g.page/r/back-in-balance/review",
  websiteUrl: "https://backinbalancechiro.com",
  bookingUrl: "https://calendly.com/back-in-balance",
  plan: "starter",
  stripeCustomerId: null,
  stripeSubId: null,
  trialEndsAt: null,
  createdAt: "2026-02-01T00:00:00.000Z",
};

const medBiz: Business = {
  id: "demo-biz-6",
  name: "Lakeside Family Medicine",
  type: "medical_practice",
  email: "office@lakesidefamily.com",
  phone: "(555) 600-7000",
  logoUrl: null,
  brandPrimaryColor: "#4338CA",
  brandSecondaryColor: "#3730A3",
  googlePlaceId: null,
  googleReviewUrl: "https://g.page/r/lakeside-family/review",
  websiteUrl: "https://lakesidefamilymedicine.com",
  bookingUrl: "https://calendly.com/lakeside-family",
  plan: "starter",
  stripeCustomerId: null,
  stripeSubId: null,
  trialEndsAt: null,
  createdAt: "2026-02-01T00:00:00.000Z",
};

const templates: Template[] = [
  {
    id: "tpl-1",
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
    businessId: BUSINESS_ID,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tpl-2",
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
    businessId: BUSINESS_ID,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tpl-3",
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
    businessId: BUSINESS_ID,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tpl-4",
    name: "New Patient Welcome",
    smsMessage:
      "Welcome to {{businessName}}, {{firstName}}! We're glad to have you as a patient: {{link}}",
    pageHeading: "Welcome, {{firstName}}!",
    pageSubheading: "We're so glad you chose us",
    sections: [
      { type: "notes", title: "Visit Summary", content: "{{customNotes}}" },
      {
        type: "links",
        title: "Get Started",
        links: [
          { label: "Patient Portal", url: "#" },
          { label: "Insurance Information", url: "#" },
        ],
      },
    ],
    showReviewCta: true,
    showBookingCta: true,
    isDefault: false,
    isSystemTemplate: false,
    businessId: BUSINESS_ID,
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
  },
  // ─── Industry-specific templates ───────────────────────
  {
    id: "tpl-5",
    name: "Pet Wellness Visit",
    smsMessage:
      "Hi {{firstName}}! Thanks for bringing your pet to {{businessName}}. Here's the visit summary: {{link}}",
    pageHeading: "Thanks for visiting, {{firstName}}!",
    pageSubheading: "Here's what we covered during today's visit",
    sections: [
      { type: "notes", title: "Visit Notes", content: "{{customNotes}}" },
      {
        type: "checklist",
        title: "Pet Care Reminders",
        items: [
          "Give heartworm prevention on the 1st of each month",
          "Watch for any changes in appetite or energy levels",
          "Keep the vaccination card in a safe place",
          "Schedule next wellness exam in 12 months",
        ],
      },
      {
        type: "links",
        title: "Pet Resources",
        links: [
          { label: "Pet Nutrition Guide", url: "https://www.avma.org" },
          { label: "Patient Portal", url: "#" },
        ],
      },
    ],
    showReviewCta: true,
    showBookingCta: true,
    isDefault: false,
    isSystemTemplate: false,
    businessId: "demo-biz-2",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tpl-6",
    name: "Salon Visit Follow-Up",
    smsMessage:
      "Hi {{firstName}}! Thanks for visiting {{businessName}} today. Here's your style recap & product recs: {{link}}",
    pageHeading: "Thanks for visiting, {{firstName}}!",
    pageSubheading: "Here's your style recap from today's session",
    sections: [
      { type: "notes", title: "Service Notes", content: "{{customNotes}}" },
      {
        type: "checklist",
        title: "Hair Care Tips",
        items: [
          "Wait 48 hours before washing color-treated hair",
          "Use sulfate-free shampoo to preserve color",
          "Apply deep conditioner once a week",
          "Book your next appointment in 6-8 weeks",
        ],
      },
      {
        type: "links",
        title: "Recommended Products",
        links: [
          { label: "Olaplex No. 3 Treatment", url: "#" },
          { label: "Book Your Next Visit", url: "#" },
        ],
      },
    ],
    showReviewCta: true,
    showBookingCta: true,
    isDefault: false,
    isSystemTemplate: false,
    businessId: "demo-biz-3",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tpl-7",
    name: "Service Summary",
    smsMessage:
      "Hi {{firstName}}! Your vehicle service at {{businessName}} is complete. Here's the summary: {{link}}",
    pageHeading: "Service Complete, {{firstName}}!",
    pageSubheading: "Here's a summary of the work performed on your vehicle",
    sections: [
      { type: "notes", title: "Service Details", content: "{{customNotes}}" },
      {
        type: "checklist",
        title: "Maintenance Reminders",
        items: [
          "Next oil change in 5,000 miles or 6 months",
          "Check tire pressure monthly",
          "Replace cabin air filter at next service",
          "Rotate tires every 7,500 miles",
        ],
      },
      {
        type: "text",
        title: "Important Notice",
        content:
          "If you notice any unusual sounds, vibrations, or warning lights after your service, please bring your vehicle back immediately — we'll take a look at no extra charge.",
      },
    ],
    showReviewCta: true,
    showBookingCta: true,
    isDefault: false,
    isSystemTemplate: false,
    businessId: "demo-biz-4",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tpl-8",
    name: "Adjustment Follow-Up",
    smsMessage:
      "Hi {{firstName}}! Here's your visit summary from {{businessName}}. Remember your exercises: {{link}}",
    pageHeading: "Visit Summary for {{firstName}}",
    pageSubheading: "Keep up the great work on your recovery",
    sections: [
      { type: "notes", title: "Adjustment Notes", content: "{{customNotes}}" },
      {
        type: "checklist",
        title: "Between-Visit Exercises",
        items: [
          "Perform prescribed stretches 2x daily (morning & evening)",
          "Apply ice for 15 minutes if soreness occurs after adjustment",
          "Stay hydrated — drink at least 8 glasses of water today",
          "Avoid heavy lifting for 24 hours",
          "Walk for at least 20 minutes daily",
        ],
      },
      {
        type: "text",
        title: "What to Expect",
        content:
          "Mild soreness for 24-48 hours after an adjustment is completely normal. This is your body adapting to improved alignment. If discomfort persists beyond 48 hours, please call our office.",
      },
    ],
    showReviewCta: true,
    showBookingCta: true,
    isDefault: false,
    isSystemTemplate: false,
    businessId: "demo-biz-5",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tpl-9",
    name: "Office Visit Follow-Up",
    smsMessage:
      "Hi {{firstName}}! Thanks for visiting {{businessName}}. Here are your visit notes & next steps: {{link}}",
    pageHeading: "Visit Summary for {{firstName}}",
    pageSubheading: "Please review your notes and follow-up items below",
    sections: [
      { type: "notes", title: "Visit Notes", content: "{{customNotes}}" },
      {
        type: "checklist",
        title: "Next Steps",
        items: [
          "Complete lab work within the next 7 days",
          "Take all medications as prescribed",
          "Schedule follow-up appointment in 3 months",
          "Call our office if symptoms worsen",
        ],
      },
      {
        type: "links",
        title: "Patient Resources",
        links: [
          { label: "Patient Portal", url: "#" },
          { label: "Lab Locations Near You", url: "#" },
          { label: "Prescription Refills", url: "#" },
        ],
      },
    ],
    showReviewCta: true,
    showBookingCta: true,
    isDefault: false,
    isSystemTemplate: false,
    businessId: "demo-biz-6",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
];

const contacts: Contact[] = [
  { id: "ct-1", firstName: "Sarah", lastName: "Johnson", phone: "(555) 123-4567", email: "sarah.j@email.com", tags: ["recurring"], source: "manual", totalFollowUps: 1, lastFollowUpAt: "2026-02-18T14:30:00.000Z", hasLeftReview: true, notes: "Preferred morning appointments", optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-01T10:00:00.000Z", updatedAt: "2026-02-18T14:30:00.000Z" },
  { id: "ct-2", firstName: "Nicole", lastName: "Chen", phone: "(555) 111-2233", email: "nicole.c@email.com", tags: ["new-patient"], source: "csv_import", totalFollowUps: 1, lastFollowUpAt: "2026-02-18T15:30:00.000Z", hasLeftReview: false, notes: null, optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-05T09:00:00.000Z", updatedAt: "2026-02-18T15:30:00.000Z" },
  { id: "ct-3", firstName: "Kevin", lastName: "Park", phone: "(555) 222-3344", email: "kevin.p@email.com", tags: ["recurring"], source: "manual", totalFollowUps: 1, lastFollowUpAt: "2026-02-18T12:30:00.000Z", hasLeftReview: true, notes: "Nervous patient — extra care needed", optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-02T14:00:00.000Z", updatedAt: "2026-02-18T12:30:00.000Z" },
  { id: "ct-4", firstName: "Priya", lastName: "Sharma", phone: "(555) 333-4455", email: "priya.s@email.com", tags: ["recurring", "vip"], source: "manual", totalFollowUps: 1, lastFollowUpAt: "2026-02-17T15:00:00.000Z", hasLeftReview: false, notes: null, optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-03T11:00:00.000Z", updatedAt: "2026-02-17T15:00:00.000Z" },
  { id: "ct-5", firstName: "Marcus", lastName: "Williams", phone: "(555) 444-5566", email: null, tags: ["new-patient"], source: "auto_saved", totalFollowUps: 1, lastFollowUpAt: "2026-02-17T11:00:00.000Z", hasLeftReview: false, notes: "Implant candidate", optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-17T11:00:00.000Z", updatedAt: "2026-02-17T11:00:00.000Z" },
  { id: "ct-6", firstName: "Olivia", lastName: "Martinez", phone: "(555) 555-6677", email: "olivia.m@email.com", tags: ["recurring"], source: "csv_import", totalFollowUps: 1, lastFollowUpAt: "2026-02-16T10:00:00.000Z", hasLeftReview: true, notes: null, optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-04T08:00:00.000Z", updatedAt: "2026-02-16T10:00:00.000Z" },
  { id: "ct-7", firstName: "Amy", lastName: "Taylor", phone: "(555) 789-0123", email: "amy.t@email.com", tags: ["vip"], source: "manual", totalFollowUps: 1, lastFollowUpAt: "2026-02-16T15:15:00.000Z", hasLeftReview: true, notes: null, optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-01T12:00:00.000Z", updatedAt: "2026-02-16T15:15:00.000Z" },
  { id: "ct-8", firstName: "Tom", lastName: "Baker", phone: "(555) 890-1234", email: null, tags: [], source: "auto_saved", totalFollowUps: 1, lastFollowUpAt: "2026-02-16T13:45:00.000Z", hasLeftReview: false, notes: null, optedOut: true, businessId: BUSINESS_ID, createdAt: "2026-02-16T13:45:00.000Z", updatedAt: "2026-02-16T13:45:00.000Z" },
  { id: "ct-9", firstName: "Rachel", lastName: "Kim", phone: "(555) 901-2345", email: "rachel.k@email.com", tags: ["recurring"], source: "manual", totalFollowUps: 1, lastFollowUpAt: "2026-02-15T11:00:00.000Z", hasLeftReview: true, notes: null, optedOut: false, businessId: BUSINESS_ID, createdAt: "2026-02-02T16:00:00.000Z", updatedAt: "2026-02-15T11:00:00.000Z" },
  { id: "ct-10", firstName: "Chris", lastName: "Davis", phone: "(555) 012-3456", email: "chris.d@email.com", tags: ["new-patient"], source: "csv_import", totalFollowUps: 1, lastFollowUpAt: "2026-02-15T09:30:00.000Z", hasLeftReview: false, notes: null, optedOut: true, businessId: BUSINESS_ID, createdAt: "2026-02-06T10:00:00.000Z", updatedAt: "2026-02-15T09:30:00.000Z" },
];

const followUps: FollowUp[] = [
  {
    id: "fu-1",
    clientFirstName: "Sarah",
    clientPhone: "(555) 123-4567",
    customNotes: "Routine cleaning completed. No cavities found! Continue flossing daily.",
    smsStatus: "delivered",
    smsSid: "SM_mock_001",
    pageViewedAt: "2026-02-18T14:45:00.000Z",
    reviewClickedAt: "2026-02-18T14:47:00.000Z",
    bookingClickedAt: null,
    templateId: "tpl-1",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-1",
    createdAt: "2026-02-18T14:30:00.000Z",
  },
  // ─── Industry demo follow-ups ──────────────────────────
  {
    id: "fu-2",
    clientFirstName: "Mike",
    clientPhone: "(555) 234-5678",
    customNotes: "Annual wellness exam for Buddy (Golden Retriever, 4 yrs). Vaccines updated — DHPP and Bordetella. Heartworm test negative. Weight 72 lbs, slightly over ideal — recommend reducing treats and adding 10 min walk.",
    smsStatus: "delivered",
    smsSid: "SM_mock_002",
    pageViewedAt: "2026-02-18T11:30:00.000Z",
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-5",
    businessId: "demo-biz-2",
    locationId: null,
    contactId: null,
    createdAt: "2026-02-18T11:15:00.000Z",
  },
  {
    id: "fu-3",
    clientFirstName: "Emma",
    clientPhone: "(555) 345-6789",
    customNotes: "Balayage highlights (honey blonde) + layered cut. Applied Olaplex No. 1 & 2 during processing. Toned with 9V. Recommend sulfate-free shampoo and weekly Olaplex No. 3 at home to maintain vibrancy.",
    smsStatus: "delivered",
    smsSid: "SM_mock_003",
    pageViewedAt: null,
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-6",
    businessId: "demo-biz-3",
    locationId: null,
    contactId: null,
    createdAt: "2026-02-18T09:45:00.000Z",
  },
  {
    id: "fu-4",
    clientFirstName: "James",
    clientPhone: "(555) 456-7890",
    customNotes: "2021 Honda Civic — 60,000-mile service. Oil & filter changed (0W-20 synthetic). Tires rotated and balanced. Brake pads at 55% front / 70% rear — good for another 20k miles. Cabin & engine air filters replaced. All fluids topped off.",
    smsStatus: "delivered",
    smsSid: "SM_mock_004",
    pageViewedAt: "2026-02-17T16:40:00.000Z",
    reviewClickedAt: "2026-02-17T16:42:00.000Z",
    bookingClickedAt: "2026-02-17T16:43:00.000Z",
    templateId: "tpl-7",
    businessId: "demo-biz-4",
    locationId: null,
    contactId: null,
    createdAt: "2026-02-17T16:20:00.000Z",
  },
  {
    id: "fu-5",
    clientFirstName: "Alex",
    clientPhone: "(555) 567-8901",
    customNotes: "Spinal adjustment T4-L5. Cervical mobility improved 15% since last visit. Trigger point therapy on upper trapezius — moderate tension noted. Recommend continued daily stretching routine and ergonomic desk setup adjustments.",
    smsStatus: "delivered",
    smsSid: "SM_mock_005",
    pageViewedAt: "2026-02-17T14:20:00.000Z",
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-8",
    businessId: "demo-biz-5",
    locationId: null,
    contactId: null,
    createdAt: "2026-02-17T14:00:00.000Z",
  },
  {
    id: "fu-6",
    clientFirstName: "David",
    clientPhone: "(555) 678-9012",
    customNotes: "Annual physical exam. BP 118/76 — normal. BMI 23.4. Cholesterol panel ordered — lab requisition attached. Vitamin D level low (22 ng/mL) — prescribed 2000 IU daily supplement. Flu shot administered. All other vitals within normal range.",
    smsStatus: "delivered",
    smsSid: "SM_mock_006",
    pageViewedAt: null,
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-9",
    businessId: "demo-biz-6",
    locationId: null,
    contactId: null,
    createdAt: "2026-02-17T10:30:00.000Z",
  },
  {
    id: "fu-7",
    clientFirstName: "Amy",
    clientPhone: "(555) 789-0123",
    customNotes: "Crown prep on #30. Temporary crown placed. Permanent crown ready in 2 weeks.",
    smsStatus: "delivered",
    smsSid: "SM_mock_007",
    pageViewedAt: "2026-02-16T15:30:00.000Z",
    reviewClickedAt: "2026-02-16T15:35:00.000Z",
    bookingClickedAt: null,
    templateId: "tpl-2",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-7",
    createdAt: "2026-02-16T15:15:00.000Z",
  },
  {
    id: "fu-8",
    clientFirstName: "Tom",
    clientPhone: "(555) 890-1234",
    customNotes: "Routine cleaning and fluoride treatment.",
    smsStatus: "delivered",
    smsSid: "SM_mock_008",
    pageViewedAt: "2026-02-16T14:00:00.000Z",
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-1",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-8",
    createdAt: "2026-02-16T13:45:00.000Z",
  },
  {
    id: "fu-9",
    clientFirstName: "Rachel",
    clientPhone: "(555) 901-2345",
    customNotes: "Retainer check. Teeth look great, continue wearing retainer nightly.",
    smsStatus: "delivered",
    smsSid: "SM_mock_009",
    pageViewedAt: "2026-02-15T11:30:00.000Z",
    reviewClickedAt: "2026-02-15T11:32:00.000Z",
    bookingClickedAt: "2026-02-15T11:33:00.000Z",
    templateId: "tpl-3",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-9",
    createdAt: "2026-02-15T11:00:00.000Z",
  },
  {
    id: "fu-10",
    clientFirstName: "Chris",
    clientPhone: "(555) 012-3456",
    customNotes: "Routine cleaning. Recommended electric toothbrush.",
    smsStatus: "delivered",
    smsSid: "SM_mock_010",
    pageViewedAt: null,
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-1",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-10",
    createdAt: "2026-02-15T09:30:00.000Z",
  },
  // ─── Additional dental follow-ups (keep dashboard at 10) ─
  {
    id: "fu-11",
    clientFirstName: "Nicole",
    clientPhone: "(555) 111-2233",
    customNotes: "Teeth whitening completed — 4 shades brighter. Avoid dark beverages and red sauces for 48 hours.",
    smsStatus: "delivered",
    smsSid: "SM_mock_011",
    pageViewedAt: "2026-02-18T16:00:00.000Z",
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-1",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-2",
    createdAt: "2026-02-18T15:30:00.000Z",
  },
  {
    id: "fu-12",
    clientFirstName: "Kevin",
    clientPhone: "(555) 222-3344",
    customNotes: "Root canal on tooth #19. Temporary filling placed. Prescribed ibuprofen 600mg as needed. Return in 2 weeks for permanent crown.",
    smsStatus: "delivered",
    smsSid: "SM_mock_012",
    pageViewedAt: "2026-02-18T13:00:00.000Z",
    reviewClickedAt: "2026-02-18T13:05:00.000Z",
    bookingClickedAt: null,
    templateId: "tpl-2",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-3",
    createdAt: "2026-02-18T12:30:00.000Z",
  },
  {
    id: "fu-13",
    clientFirstName: "Priya",
    clientPhone: "(555) 333-4455",
    customNotes: "Periodontal maintenance visit. Gum health improved — pocket depths reduced from 5mm to 3mm. Continue prescribed chlorhexidine rinse.",
    smsStatus: "delivered",
    smsSid: "SM_mock_013",
    pageViewedAt: null,
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId: "tpl-1",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-4",
    createdAt: "2026-02-17T15:00:00.000Z",
  },
  {
    id: "fu-14",
    clientFirstName: "Marcus",
    clientPhone: "(555) 444-5566",
    customNotes: "Dental implant consultation for missing #8. Treatment plan: bone graft in 4 weeks, implant placement 4 months later. Estimate provided.",
    smsStatus: "delivered",
    smsSid: "SM_mock_014",
    pageViewedAt: "2026-02-17T11:30:00.000Z",
    reviewClickedAt: null,
    bookingClickedAt: "2026-02-17T11:35:00.000Z",
    templateId: "tpl-2",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-5",
    createdAt: "2026-02-17T11:00:00.000Z",
  },
  {
    id: "fu-15",
    clientFirstName: "Olivia",
    clientPhone: "(555) 555-6677",
    customNotes: "Child's first dental visit (age 3). All 20 primary teeth present and healthy. No cavities! Great job with brushing. See you in 6 months.",
    smsStatus: "delivered",
    smsSid: "SM_mock_015",
    pageViewedAt: "2026-02-16T10:30:00.000Z",
    reviewClickedAt: "2026-02-16T10:33:00.000Z",
    bookingClickedAt: null,
    templateId: "tpl-1",
    businessId: BUSINESS_ID,
    locationId: null,
    contactId: "ct-6",
    createdAt: "2026-02-16T10:00:00.000Z",
  },
];

const snippets: Snippet[] = [
  { id: "snp-1", label: "Take ibuprofen as needed for 3 days", text: "Take ibuprofen as needed for 3 days", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-2", label: "Soft foods only for 24 hours", text: "Soft foods only for 24 hours", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-3", label: "Call if pain persists beyond 48 hours", text: "Call if pain persists beyond 48 hours", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-4", label: "Avoid hot/cold foods today", text: "Avoid hot/cold foods today", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-5", label: "Floss gently around the treated area", text: "Floss gently around the treated area", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-6", label: "Rinse with warm salt water tonight", text: "Rinse with warm salt water tonight", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-7", label: "Schedule next visit in 6 months", text: "Schedule next visit in 6 months", category: "scheduling", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-8", label: "Wear retainer every night", text: "Wear retainer every night", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "snp-9", label: "Use prescribed mouthwash twice daily", text: "Use prescribed mouthwash twice daily", category: "aftercare", businessId: BUSINESS_ID, createdAt: "2026-02-01T00:00:00.000Z" },
];

// ─── Mock Database (mutable in-memory store) ──────────────

export const mockDb = {
  businesses: [business, vetBiz, salonBiz, autoBiz, chiroBiz, medBiz] as Business[],
  templates: [...templates] as Template[],
  followUps: [...followUps] as FollowUp[],
  snippets: [...snippets] as Snippet[],
  optOuts: [] as OptOut[],
  leads: [] as Lead[],
  contacts: [...contacts] as Contact[],
  importJobs: [] as ImportJob[],

  // Helper methods
  getBusiness(id: string) {
    return this.businesses.find((b) => b.id === id) || null;
  },
  getBusinessForUser(_userId: string) {
    // In production: look up user's businessId
    return this.businesses[0] || null;
  },
  getTemplates(businessId: string) {
    return this.templates.filter(
      (t) => t.businessId === businessId || t.isSystemTemplate
    );
  },
  getTemplate(id: string) {
    return this.templates.find((t) => t.id === id) || null;
  },
  getFollowUps(businessId: string) {
    return this.followUps
      .filter((f) => f.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getFollowUp(id: string) {
    return this.followUps.find((f) => f.id === id) || null;
  },
  getSnippets(businessId: string) {
    return this.snippets.filter((s) => s.businessId === businessId);
  },
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  },

  // ─── Contact helpers ──────────────────────────────────────
  getContacts(businessId: string) {
    return this.contacts
      .filter((c) => c.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getContact(id: string) {
    return this.contacts.find((c) => c.id === id) || null;
  },
  findContactByPhone(phone: string, businessId: string) {
    const digits = phone.replace(/\D/g, "");
    return this.contacts.find(
      (c) => c.businessId === businessId && c.phone.replace(/\D/g, "") === digits
    ) || null;
  },
  searchContacts(businessId: string, query: string) {
    const q = query.toLowerCase();
    return this.contacts
      .filter(
        (c) =>
          c.businessId === businessId &&
          !c.optedOut &&
          (c.firstName.toLowerCase().includes(q) ||
            (c.lastName || "").toLowerCase().includes(q) ||
            c.phone.includes(q))
      )
      .slice(0, 5);
  },
  getContactFollowUps(contactId: string) {
    return this.followUps
      .filter((f) => f.contactId === contactId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // ─── Opt-Out helpers ────────────────────────────────────

  isOptedOut(phone: string, businessId: string) {
    return this.optOuts.some((o) => o.phone === phone && o.businessId === businessId);
  },

  addOptOut(phone: string, businessId: string) {
    if (this.isOptedOut(phone, businessId)) return;
    this.optOuts.push({
      id: `opt-${this.generateId()}`,
      phone,
      businessId,
      createdAt: new Date().toISOString(),
    });
    console.log(`[OptOut] ${phone} opted out of business ${businessId}`);
  },

  removeOptOut(phone: string, businessId: string) {
    this.optOuts = this.optOuts.filter(
      (o) => !(o.phone === phone && o.businessId === businessId)
    );
    console.log(`[OptOut] ${phone} opted back in for business ${businessId}`);
  },

  /** Find all business IDs that have sent follow-ups to this phone number. */
  getBusinessIdsForPhone(phone: string): string[] {
    // Inline normalization to avoid circular import with twilio.ts
    const normalizeInline = (p: string) => {
      const d = p.replace(/\D/g, "");
      if (d.length === 10) return `+1${d}`;
      if (d.length === 11 && d.startsWith("1")) return `+${d}`;
      return `+${d}`;
    };
    const normalized = normalizeInline(phone);

    const bizIds = new Set<string>();
    for (const fu of this.followUps) {
      if (normalizeInline(fu.clientPhone) === normalized) {
        bizIds.add(fu.businessId);
      }
    }
    return Array.from(bizIds);
  },

  // ─── Lead helpers ───────────────────────────────────────

  addLead(email: string) {
    const lower = email.toLowerCase().trim();
    if (this.leads.some((l) => l.email === lower)) return;
    this.leads.push({
      id: `lead-${this.generateId()}`,
      email: lower,
      createdAt: new Date().toISOString(),
    });
    console.log(`[Leads] Captured email: ${lower}`);
  },
};
