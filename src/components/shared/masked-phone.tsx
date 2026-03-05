"use client";

import { useState, useEffect, useCallback } from "react";
import { maskPhone, formatPhoneDisplay, phoneToTelHref } from "@/lib/phone";

interface MaskedPhoneProps {
  phone: string;
  className?: string;
}

export function MaskedPhone({ phone, className = "" }: MaskedPhoneProps) {
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setRevealed(false), 5000);
    return () => clearTimeout(timer);
  }, [revealed]);

  return (
    <a
      href={phoneToTelHref(phone)}
      onClick={(e) => {
        if (!revealed) {
          e.preventDefault();
          reveal();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !revealed) {
          e.preventDefault();
          reveal();
        }
      }}
      className={`inline-flex items-center gap-1 transition-colors hover:text-teal-600 ${className}`}
      title={revealed ? "Tap to call" : "Click to reveal"}
      aria-label={revealed ? `Call ${formatPhoneDisplay(phone)}` : "Click to reveal phone number"}
    >
      {revealed ? formatPhoneDisplay(phone) : maskPhone(phone)}
    </a>
  );
}
