import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-warm-400">
        <li>
          <Link href="/dashboard" className="hover:text-teal-600 transition-colors">
            Dashboard
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-warm-300" />
            {item.href ? (
              <Link href={item.href} className="hover:text-teal-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-warm-600 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
