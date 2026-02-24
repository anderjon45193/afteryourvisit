import { Star } from "lucide-react";

interface PhoneMockupProps {
  variant?: "dental" | "vet";
}

function getRelativeDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const content = {
  dental: {
    initials: "SM",
    business: "Smile Dental Care",
    greeting: "Thanks for visiting, Sarah!",
    get date() { return getRelativeDate(1); },
    notesTitle: "Your Visit Notes",
    notes: "Routine cleaning completed. No cavities found! Continue flossing daily and brushing 2x per day.",
    checklistTitle: "Things to Remember",
    checklist: ["Brush 2x daily", "Floss every evening", "Next visit in 6 months"],
  },
  vet: {
    initials: "HP",
    business: "Happy Paws Vet Clinic",
    greeting: "Thanks for bringing Buddy in!",
    get date() { return getRelativeDate(0); },
    notesTitle: "Visit Notes",
    notes: "Annual check-up complete. Buddy is in great health! Vaccinations updated. Weight: 45 lbs (ideal range).",
    checklistTitle: "Things to Remember",
    checklist: ["Give heartworm pill monthly", "Next vaccines in 1 year", "Schedule dental cleaning"],
  },
};

export function PhoneMockup({ variant = "dental" }: PhoneMockupProps) {
  const c = content[variant];
  const accentColor = variant === "vet" ? "teal" : "teal";

  return (
    <div className="relative">
      {/* Glow behind phone */}
      <div className="absolute inset-0 bg-teal-200/20 rounded-[3rem] blur-2xl scale-110" />

      {/* Phone frame */}
      <div className="relative w-[280px] sm:w-[320px] bg-warm-900 rounded-[2.5rem] p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-warm-900 rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden">
          <div className="p-5 pt-8">
            {/* Business logo placeholder */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-teal-700 font-bold text-lg">{c.initials}</span>
              </div>
            </div>
            <p className="text-center text-xs text-warm-500 mb-4">
              {c.business}
            </p>

            {/* Divider */}
            <div className="h-px bg-teal-200 mb-4" />

            {/* Greeting */}
            <p className="font-[family-name:var(--font-display)] text-lg text-center text-warm-900 mb-1">
              {c.greeting}
            </p>
            <p className="text-[10px] text-center text-warm-400 mb-4">
              {c.date}
            </p>

            {/* Visit notes card */}
            <div className="bg-teal-50 rounded-xl p-3 mb-3 border-l-2 border-teal-500">
              <p className="text-[10px] font-semibold text-warm-700 mb-1">
                {c.notesTitle}
              </p>
              <p className="text-[9px] text-warm-600 leading-relaxed">
                {c.notes}
              </p>
            </div>

            {/* Checklist */}
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-warm-700 mb-2">
                {c.checklistTitle}
              </p>
              {c.checklist.map((item) => (
                <div key={item} className="flex items-center gap-2 mb-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-teal-400 flex-shrink-0" />
                  <span className="text-[9px] text-warm-600">{item}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <button className="w-full py-2 px-3 rounded-lg border border-warm-200 text-[10px] font-medium text-warm-700 mb-2">
              Book Your Next Visit
            </button>
            <button className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-md">
              <Star className="w-3 h-3 fill-white" />
              Leave Us a Review
            </button>
            <p className="text-[8px] text-center text-warm-400 mt-1.5">
              It only takes 30 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
