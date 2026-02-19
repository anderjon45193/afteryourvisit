import { Star, Calendar, ClipboardList, ExternalLink, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Section } from "@/lib/types";
import { notFound } from "next/navigation";
import { TrackingPixel, TrackingLink } from "./tracking";

export default async function FollowUpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Load from database
  const followUp = await prisma.followUp.findUnique({
    where: { id },
    include: {
      business: true,
      template: true,
    },
  });

  if (!followUp) {
    notFound();
  }

  const business = followUp.business;
  const template = followUp.template;

  const heading = template.pageHeading.replace(
    "{{firstName}}",
    followUp.clientFirstName
  );

  const visitDate = new Date(followUp.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const initials = business.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sections = template.sections as unknown as Section[];

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Fire-and-forget page view tracking */}
      <TrackingPixel followUpId={id} />

      <div className="mx-auto max-w-[480px] px-5 py-8">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 shadow-md ring-4 ring-white mb-3">
            <span
              className="text-xl font-bold"
              style={{ color: business.brandPrimaryColor }}
            >
              {initials}
            </span>
          </div>
          <p className="text-sm text-warm-500 font-medium">{business.name}</p>
          <div
            className="h-0.5 w-12 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: business.brandPrimaryColor }}
          />
        </header>

        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl text-warm-900 mb-1">{heading}</h1>
          <p className="text-sm text-warm-400 flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {visitDate}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section: Section, i: number) => {
            if (section.type === "notes" && followUp.customNotes) {
              return (
                <div
                  key={i}
                  className="bg-teal-50/60 rounded-xl p-5 border-l-[3px]"
                  style={{ borderLeftColor: business.brandPrimaryColor }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <ClipboardList
                      className="w-4 h-4"
                      style={{ color: business.brandPrimaryColor }}
                    />
                    <h2 className="text-sm font-semibold text-warm-700 font-[family-name:var(--font-body)]">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-sm text-warm-600 leading-relaxed">
                    {followUp.customNotes}
                  </p>
                </div>
              );
            }

            if (section.type === "checklist" && section.items) {
              return (
                <div key={i} className="bg-white rounded-xl p-5 shadow-card">
                  <h2 className="text-sm font-semibold text-warm-700 mb-3 font-[family-name:var(--font-body)]">
                    {section.title}
                  </h2>
                  <div className="space-y-2.5">
                    {section.items.map((item: string, j: number) => (
                      <div key={j} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                          style={{ borderColor: business.brandPrimaryColor }}
                        />
                        <span className="text-sm text-warm-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (section.type === "links" && section.links) {
              return (
                <div key={i} className="bg-white rounded-xl p-5 shadow-card">
                  <h2 className="text-sm font-semibold text-warm-700 mb-3 font-[family-name:var(--font-body)]">
                    {section.title}
                  </h2>
                  <div className="space-y-2">
                    {section.links.map(
                      (link: { label: string; url: string }, j: number) => (
                        <a
                          key={j}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-warm-50 hover:bg-teal-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <ExternalLink className="w-4 h-4 text-warm-400 group-hover:text-teal-600" />
                            <span className="text-sm text-warm-700 group-hover:text-teal-700">
                              {link.label}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-warm-300 group-hover:text-teal-500" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              );
            }

            if (section.type === "text") {
              return (
                <div key={i} className="bg-white rounded-xl p-5 shadow-card">
                  <h2 className="text-sm font-semibold text-warm-700 mb-2 font-[family-name:var(--font-body)]">
                    {section.title}
                  </h2>
                  <p className="text-sm text-warm-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* CTA Area */}
        <div className="mt-8 bg-gradient-to-b from-teal-50/50 to-white rounded-2xl p-6 border border-warm-100">
          {template.showBookingCta && business.bookingUrl && (
            <TrackingLink
              followUpId={id}
              type="booking"
              href={business.bookingUrl}
              className="block w-full py-3.5 px-4 rounded-xl border-[1.5px] border-warm-200 text-center text-sm font-semibold text-warm-700 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50 transition-all mb-3"
            >
              Book Your Next Visit
            </TrackingLink>
          )}

          {template.showReviewCta && business.googleReviewUrl && (
            <>
              <TrackingLink
                followUpId={id}
                type="review"
                href={business.googleReviewUrl}
                className="block w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-center text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all animate-glow-pulse"
              >
                <span className="inline-flex items-center gap-2">
                  <Star className="w-4 h-4 fill-white animate-sparkle" />
                  Leave Us a Review
                </span>
              </TrackingLink>
              <p className="text-center text-xs text-warm-400 mt-2.5">
                It only takes 30 seconds and means the world to us.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-xs text-warm-300">
            Powered by{" "}
            <a
              href="/"
              className="text-warm-400 hover:text-teal-500 transition-colors"
            >
              AfterYourVisit
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
