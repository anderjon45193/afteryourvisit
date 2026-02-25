"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle, AlertTriangle, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl text-warm-900 mb-2">Invalid reset link</h1>
          <p className="text-sm text-warm-400 mb-6">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Request New Link
            </Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl text-warm-900 mb-2">Password reset!</h1>
          <p className="text-sm text-warm-400 mb-6">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Link href="/sign-in">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Sign In
            </Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-teal-600" />
        </div>
        <h1 className="text-2xl text-warm-900 mb-1">Set a new password</h1>
        <p className="text-sm text-warm-400">
          Choose a strong password for your account.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-warm-700 mb-1.5">
            New password
          </label>
          <div className="relative">
            <Input
              id="new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-11 pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-warm-700 mb-1.5">
            Confirm password
          </label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="h-11"
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
            "Reset Password"
          )}
        </Button>
      </form>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-50/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-[family-name:var(--font-display)] text-2xl text-teal-700 tracking-tight">
              AfterYourVisit
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
