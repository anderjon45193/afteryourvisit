"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      {/* Background accents */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-50/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-[family-name:var(--font-display)] text-2xl text-teal-700 tracking-tight">
              AfterYourVisit
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-8">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-2xl text-warm-900 mb-2">Check your email</h1>
              <p className="text-sm text-warm-400 mb-6">
                If an account exists for <strong className="text-warm-600">{email}</strong>, we&apos;ve sent a
                password reset link. It expires in 1 hour.
              </p>
              <p className="text-xs text-warm-400 mb-6">
                Don&apos;t see it? Check your spam folder.
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-2xl text-warm-900 mb-1">Forgot your password?</h1>
                <p className="text-sm text-warm-400">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-warm-700 mb-1.5">
                    Email address
                  </label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="you@yourbusiness.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Back to sign in */}
        {!sent && (
          <p className="text-center text-sm text-warm-400 mt-6">
            <Link
              href="/sign-in"
              className="font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
