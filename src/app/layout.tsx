import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/shared/session-provider";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — AfterYourVisit",
    default: "AfterYourVisit — Smart Follow-Up Texts for Local Businesses",
  },
  description:
    "Send beautiful follow-up texts after every appointment. Generate Google reviews on autopilot. Free 14-day trial.",
  keywords: [
    "follow-up texts",
    "Google reviews",
    "appointment follow-up",
    "dentist reviews",
    "vet follow-up",
    "local business reviews",
  ],
  metadataBase: new URL("https://afteryourvisit.com"),
  openGraph: {
    siteName: "AfterYourVisit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerif.variable} ${plusJakarta.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
