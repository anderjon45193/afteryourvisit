import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AfterYourVisit account to manage follow-ups and grow your Google reviews.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
