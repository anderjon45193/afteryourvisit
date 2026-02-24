import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ClientPreview } from "@/components/landing/client-preview";
import { Industries } from "@/components/landing/industries";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "AfterYourVisit — Smart Follow-Up Texts for Local Businesses",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AfterYourVisit — Smart Follow-Up Texts for Local Businesses",
    description:
      "Send beautiful follow-up texts after every appointment. Generate Google reviews on autopilot.",
    url: "https://afteryourvisit.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AfterYourVisit",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://afteryourvisit.com",
  description:
    "Smart follow-up texts for local businesses. Send branded follow-up texts after every appointment and generate Google reviews on autopilot.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "29",
    highPrice: "99",
    priceCurrency: "USD",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "127",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <HowItWorks />
        <ClientPreview />
        <Industries />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
