"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
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
          <div className="text-center mb-6">
            <h1 className="text-2xl text-warm-900 mb-1">Welcome back</h1>
            <p className="text-sm text-warm-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Success message from registration */}
          {registered && (
            <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700 flex items-start gap-2">
              <span>Account created successfully! Sign in to get started.</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-sm font-medium text-warm-700 mb-1.5">
                Email address
              </label>
              <Input
                id="signin-email"
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="signin-password" className="text-sm font-medium text-warm-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-100">
            <p className="text-xs font-medium text-teal-700 mb-1">Demo credentials:</p>
            <p className="text-xs text-teal-600 font-mono">demo@afteryourvisit.com</p>
            <p className="text-xs text-teal-600 font-mono">demo1234</p>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-warm-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-teal-600 hover:text-teal-700"
          >
            Start your free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
