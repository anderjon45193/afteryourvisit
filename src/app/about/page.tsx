import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "AfterYourVisit helps local service businesses send beautiful, branded follow-up texts that delight clients and generate 5-star Google reviews.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About AfterYourVisit",
    description:
      "AfterYourVisit helps local service businesses send beautiful, branded follow-up texts that delight clients and generate 5-star Google reviews.",
    url: "https://afteryourvisit.com/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-warm-50 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl text-warm-900 mb-4 font-[family-name:var(--font-display)]">
            About AfterYourVisit
          </h1>
          <p className="text-lg text-warm-500 mb-10 leading-relaxed">
            We believe every visit deserves a follow-up.
          </p>

          <div className="space-y-8 text-warm-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-warm-800 mb-3 font-[family-name:var(--font-body)]">
                Our Mission
              </h2>
              <p>
                AfterYourVisit helps local service businesses — dentists,
                veterinarians, mechanics, salons, chiropractors, and more — send
                beautiful, branded follow-up texts to clients immediately after
                appointments. Each text contains a link to a personalized
                follow-up page with visit notes, next steps, helpful resources,
                and a Google Review prompt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-800 mb-3 font-[family-name:var(--font-body)]">
                Why We Built This
              </h2>
              <p>
                Getting Google reviews is critical for local businesses, but
                asking for them feels awkward. We built AfterYourVisit so that
                the review ask is wrapped in genuine value — a useful summary of
                the client&apos;s visit. Clients appreciate the follow-up, and
                businesses see their review counts climb naturally.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-800 mb-3 font-[family-name:var(--font-body)]">
                How It Works
              </h2>
              <p>
                After a client visits, you tap &ldquo;Send&rdquo; in your
                dashboard. The client receives a branded text with a link to
                their personalized follow-up page — visit notes, aftercare
                instructions, and a warm invitation to leave a review. No app
                downloads, no logins, no friction.
              </p>
            </section>

            <div className="pt-4">
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
