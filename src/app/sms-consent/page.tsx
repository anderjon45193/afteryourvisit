import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "SMS Consent & Opt-In Policy — AfterYourVisit",
  description:
    "Learn how AfterYourVisit collects consent before sending follow-up text messages on behalf of service businesses.",
};

export default function SmsConsentPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20 font-[family-name:var(--font-body)]">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-gray-900 mb-4">
          SMS Consent &amp; Opt-In Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: February 20, 2026
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              About AfterYourVisit
            </h2>
            <p>
              AfterYourVisit is a platform used by service businesses — such as
              dental offices, veterinary clinics, auto repair shops, and salons —
              to send a single post-appointment follow-up text message to their
              clients. The message contains a personalized link to a branded page
              with visit notes, care instructions, next steps, and an optional
              review prompt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              How Consent Is Collected
            </h2>
            <p>
              Consent is collected <strong>in person at the point of service</strong>.
              During or after an appointment, the client voluntarily provides
              their phone number and first name to the business staff. The staff
              member enters this information into the AfterYourVisit dashboard
              before sending the follow-up message.
            </p>
            <p className="mt-3">
              By providing their phone number directly to the business, the
              client consents to receiving a single follow-up text message
              related to their visit. The client is informed at the time of
              collection that they will receive one text message with their visit
              summary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Message Frequency
            </h2>
            <p>
              Clients receive <strong>one text message per visit</strong>. This
              is not a recurring subscription or marketing campaign. No
              additional messages are sent unless the client visits the business
              again and provides consent for a new follow-up.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Message Content
            </h2>
            <p>Each text message includes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>A personalized greeting using the client&apos;s first name</li>
              <li>The name of the business they visited</li>
              <li>A link to their visit summary page</li>
              <li>Instructions on how to opt out</li>
            </ul>
            <p className="mt-3">Example message:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 text-sm font-mono">
              Hi Sarah! Thanks for visiting Bright Smile Dental today.
              Here&apos;s your visit summary: https://www.afteryourvisit.com/v/abc123
              <br /><br />
              Reply STOP to opt out
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              How to Opt Out
            </h2>
            <p>
              Recipients can opt out at any time by replying <strong>STOP</strong> to
              any message received from AfterYourVisit. Upon opting out, no
              further messages will be sent from any business using the platform.
              Other supported opt-out keywords include: UNSUBSCRIBE, CANCEL, END,
              and QUIT.
            </p>
            <p className="mt-3">
              To opt back in, reply <strong>START</strong> or <strong>YES</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Message &amp; Data Rates
            </h2>
            <p>
              Standard message and data rates may apply depending on the
              recipient&apos;s mobile carrier and plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Information
            </h2>
            <p>
              If you have questions about this policy or wish to opt out, please
              contact us at{" "}
              <a
                href="mailto:support@afteryourvisit.com"
                className="text-teal-600 hover:underline"
              >
                support@afteryourvisit.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              For Businesses
            </h2>
            <p>
              Businesses using AfterYourVisit are responsible for obtaining
              proper verbal consent from their clients before entering contact
              information into the platform. By using AfterYourVisit, businesses
              agree to only send follow-up messages to clients who have
              voluntarily provided their phone number and been informed that they
              will receive a text message.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-teal-600 hover:underline text-sm"
          >
            &larr; Back to AfterYourVisit.com
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
