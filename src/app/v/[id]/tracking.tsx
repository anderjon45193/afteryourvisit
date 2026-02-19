"use client";

import { useEffect } from "react";

export function TrackingPixel({ followUpId }: { followUpId: string }) {
  useEffect(() => {
    // Fire-and-forget page view tracking
    fetch(`/api/v/${followUpId}/viewed`, { method: "POST" }).catch(() => {});
  }, [followUpId]);

  return null;
}

export function TrackingLink({
  followUpId,
  type,
  href,
  className,
  children,
}: {
  followUpId: string;
  type: "review" | "booking";
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        navigator.sendBeacon?.(`/api/v/${followUpId}/${type}`) ||
          fetch(`/api/v/${followUpId}/${type}`, { method: "POST" });
      }}
    >
      {children}
    </a>
  );
}
