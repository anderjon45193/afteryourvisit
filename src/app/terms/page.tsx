import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Terms of Service",
  description:
    "Read the AfterYourVisit Terms of Service. Understand your rights and responsibilities when using our platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-warm-50 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl text-warm-900 font-[family-name:var(--font-display)] mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-warm max-w-none space-y-6 text-warm-700 text-sm leading-relaxed">
            <p className="text-warm-500 text-xs">Last updated: February 2026</p>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using AfterYourVisit (&ldquo;the Service&rdquo;), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">2. Description of Service</h2>
              <p>
                AfterYourVisit provides a platform for service businesses to send branded follow-up text
                messages to clients after appointments. The Service includes SMS delivery, follow-up page
                hosting, contact management, analytics, and related features.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">3. Account Registration</h2>
              <p>
                You must provide accurate and complete information when creating an account. You are
                responsible for maintaining the security of your account credentials and for all activity
                that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">4. SMS Compliance</h2>
              <p>
                You are responsible for obtaining proper consent from your clients before sending them
                text messages through our platform. You must comply with all applicable laws and
                regulations, including the Telephone Consumer Protection Act (TCPA) and 10DLC requirements.
                All messages sent through our platform include opt-out instructions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Send unsolicited or spam messages</li>
                <li>Include protected health information (PHI) in visit notes</li>
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with the proper operation of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">6. Billing and Payments</h2>
              <p>
                Paid plans are billed monthly or annually as selected. Your subscription will automatically
                renew unless cancelled. You may cancel at any time through the billing settings. Refunds
                are handled on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">7. Free Trial</h2>
              <p>
                New accounts receive a 14-day free trial. No credit card is required to start a trial.
                At the end of the trial period, you will need to subscribe to a paid plan to continue
                using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">8. Limitation of Liability</h2>
              <p>
                AfterYourVisit is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for
                any indirect, incidental, or consequential damages arising from your use of the Service,
                including but not limited to SMS delivery failures or delays.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account if you violate these terms.
                You may delete your account at any time by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-warm-900 mt-8 mb-3">10. Contact</h2>
              <p>
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:support@afteryourvisit.com" className="text-teal-600 hover:text-teal-700 underline">
                  support@afteryourvisit.com
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
