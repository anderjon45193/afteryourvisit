"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, Sparkles, DollarSign, Building2, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "/#how-it-works", icon: Sparkles },
    { label: "Pricing", href: "/#pricing", icon: DollarSign },
    { label: "Industries", href: "/#industries", icon: Building2 },
    { label: "FAQ", href: "/#faq", icon: HelpCircle },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="AfterYourVisit home">
            <span className="font-[family-name:var(--font-display)] text-xl text-teal-700 tracking-tight">
              AfterYourVisit
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-warm-600 hover:text-teal-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-warm-600">
                    Log In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <div className="px-6 pt-7 pb-5 border-b border-warm-100">
                <span className="font-[family-name:var(--font-display)] text-xl text-teal-700">
                  AfterYourVisit
                </span>
              </div>

              <nav className="px-4 py-4 space-y-1.5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14.5px] font-medium text-warm-500 hover:bg-warm-50 hover:text-warm-700 transition-all"
                  >
                    <link.icon className="w-[18px] h-[18px] flex-shrink-0 text-warm-400" />
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-warm-100 space-y-3">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 text-[14.5px] font-semibold">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up" className="block" onClick={() => setMenuOpen(false)}>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 text-[14.5px] font-semibold">
                        Start Free Trial
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/sign-in" className="block" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-warm-500 hover:text-warm-700 hover:bg-warm-50 rounded-xl h-11 text-[14.5px] font-medium">
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
