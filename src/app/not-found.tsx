import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-teal-600 mb-4">404</p>
        <h1 className="text-2xl text-warm-900 mb-2 font-[family-name:var(--font-display)]">
          Page not found
        </h1>
        <p className="text-warm-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-warm-200 text-warm-700 hover:bg-warm-100 font-semibold transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
