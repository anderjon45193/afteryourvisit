import { Star, Calendar, ClipboardList, ExternalLink, ArrowRight } from "lucide-react";
import type { Section } from "@/lib/types";

interface FollowUpPreviewProps {
  pageHeading: string;
  pageSubheading: string;
  sections: Section[];
  showReviewCta: boolean;
  showBookingCta: boolean;
  businessName: string;
  brandPrimaryColor: string;
}

export function FollowUpPreview({
  pageHeading,
  pageSubheading,
  sections,
  showReviewCta,
  showBookingCta,
  businessName,
  brandPrimaryColor,
}: FollowUpPreviewProps) {
  const heading = pageHeading.replace("{{firstName}}", "Sarah");
  const initials = businessName
    ? businessName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AV";

  const visitDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const color = brandPrimaryColor || "#14B8A6";

  return (
    <div className="min-h-full bg-warm-50">
      <div className="mx-auto max-w-[480px] px-5 py-8">
        {/* Header */}
        <header className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full shadow-md ring-4 ring-white mb-3"
            style={{ backgroundColor: `${color}20` }}
          >
            <span className="text-xl font-bold" style={{ color }}>
              {initials}
            </span>
          </div>
          <p className="text-sm text-warm-500 font-medium">
            {businessName || "Your Business"}
          </p>
          <div
            className="h-0.5 w-12 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: color }}
          />
        </header>

        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-2xl text-warm-900 mb-1">{heading || "Thanks for visiting!"}</h1>
          {pageSubheading && (
            <p className="text-sm text-warm-500 mt-1">{pageSubheading}</p>
          )}
          <p className="text-sm text-warm-400 flex items-center justify-center gap-1.5 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {visitDate}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, i) => {
            if (section.type === "notes") {
              return (
                <div
                  key={i}
                  className="bg-teal-50/60 rounded-xl p-5 border-l-[3px]"
                  style={{ borderLeftColor: color }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <ClipboardList className="w-4 h-4" style={{ color }} />
                    <h2 className="text-sm font-semibold text-warm-700">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-sm text-warm-600 leading-relaxed">
                    Everything looked great today. Remember to floss daily and use the
                    recommended mouthwash.
                  </p>
                </div>
              );
            }

            if (section.type === "checklist" && section.items) {
              return (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-warm-700 mb-3">
                    {section.title}
                  </h2>
                  <div className="space-y-2.5">
                    {section.items.filter(Boolean).map((item, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                          style={{ borderColor: color }}
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
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-warm-700 mb-3">
                    {section.title}
                  </h2>
                  <div className="space-y-2">
                    {section.links
                      .filter((l) => l.label)
                      .map((link, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between p-3 rounded-lg bg-warm-50"
                        >
                          <div className="flex items-center gap-2.5">
                            <ExternalLink className="w-4 h-4 text-warm-400" />
                            <span className="text-sm text-warm-700">
                              {link.label}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-warm-300" />
                        </div>
                      ))}
                  </div>
                </div>
              );
            }

            if (section.type === "text") {
              return (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-warm-700 mb-2">
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
          {showBookingCta && (
            <div className="block w-full py-3.5 px-4 rounded-xl border-[1.5px] border-warm-200 text-center text-sm font-semibold text-warm-700 mb-3">
              Book Your Next Visit
            </div>
          )}

          {showReviewCta && (
            <>
              <div className="block w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-center text-sm font-bold text-white shadow-lg">
                <span className="inline-flex items-center gap-2">
                  <Star className="w-4 h-4 fill-white" />
                  Leave Us a Review
                </span>
              </div>
              <p className="text-center text-xs text-warm-400 mt-2.5">
                It only takes 30 seconds and means the world to us.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-xs text-warm-300">
            Powered by <span className="text-warm-400">AfterYourVisit</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
