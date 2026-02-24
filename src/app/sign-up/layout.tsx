import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Start your free 14-day trial. Send branded follow-up texts and generate Google reviews on autopilot.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
