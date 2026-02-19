import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Industries", href: "#industries" },
    { label: "Templates", href: "#industries" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Help Center", href: "/help" },
    { label: "API Docs", href: "/docs" },
    { label: "Status", href: "/status" },
    { label: "Changelog", href: "/changelog" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "HIPAA", href: "/hipaa" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-warm-900 text-warm-300 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-[family-name:var(--font-display)] text-lg text-white">
              AfterYourVisit
            </span>
            <p className="mt-3 text-sm text-warm-400 leading-relaxed">
              Smart follow-up texts for local businesses. Delight your clients.
              Grow your reviews.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white text-sm mb-4 font-[family-name:var(--font-body)]">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-warm-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-warm-500">
            &copy; {new Date().getFullYear()} AfterYourVisit. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-warm-500 hover:text-teal-400 transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-warm-500 hover:text-teal-400 transition-colors text-sm">
              LinkedIn
            </a>
            <a href="#" className="text-warm-500 hover:text-teal-400 transition-colors text-sm">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
