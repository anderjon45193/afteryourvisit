import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how AfterYourVisit collects, uses, and protects your data. Read our privacy policy.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-warm-50 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl text-warm-900 font-[family-name:var(--font-display)] mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-warm max-w-none space-y-6 text-warm-700 text-sm leading-relaxed">
            <p className="text-warm-500 text-xs">Last updated: February 2026</p>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide when creating an account, including your name, email address,
                business name, phone number, and website URL. We also collect information about your clients
                that you enter into the platform, such as first names and phone numbers used for sending
                follow-up messages.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide and maintain the AfterYourVisit service</li>
                <li>Send follow-up text messages to your clients on your behalf</li>
                <li>Process payments and manage your subscription</li>
                <li>Send you service-related communications</li>
                <li>Improve our platform and develop new features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">3. SMS and Client Data</h2>
              <p>
                Client phone numbers are used solely for sending follow-up messages on your behalf via our
                SMS provider (Twilio). We do not sell or share client phone numbers with third parties.
                Clients can opt out of messages at any time by replying STOP.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">4. Data Storage and Security</h2>
              <p>
                Your data is stored securely using industry-standard encryption. We use PostgreSQL databases
                hosted on trusted cloud infrastructure. We do not store protected health information (PHI)
                and advise users not to include diagnoses, medications, or specific health conditions in
                visit notes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">5. Third-Party Services</h2>
              <p>We use the following third-party services to operate our platform:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Twilio for SMS delivery</li>
                <li>Stripe for payment processing</li>
                <li>Supabase for database hosting</li>
                <li>Vercel for application hosting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">6. Data Retention</h2>
              <p>
                Follow-up data is retained for 12 months, after which it is anonymized. You can request
                deletion of your account and all associated data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">7. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time
                through your account settings. For data deletion requests, please contact us at{" "}
                <a href="mailto:privacy@afteryourvisit.com" className="text-teal-600 hover:text-teal-700 underline">
                  privacy@afteryourvisit.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">8. Contact</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@afteryourvisit.com" className="text-teal-600 hover:text-teal-700 underline">
                  privacy@afteryourvisit.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
