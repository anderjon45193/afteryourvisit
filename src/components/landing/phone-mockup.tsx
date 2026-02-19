import { Star } from "lucide-react";

export function PhoneMockup() {
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
                <span className="text-teal-700 font-bold text-lg">SM</span>
              </div>
            </div>
            <p className="text-center text-xs text-warm-500 mb-4">
              Smile Dental Care
            </p>

            {/* Divider */}
            <div className="h-px bg-teal-200 mb-4" />

            {/* Greeting */}
            <h3 className="font-[family-name:var(--font-display)] text-lg text-center text-warm-900 mb-1">
              Thanks for visiting, Sarah!
            </h3>
            <p className="text-[10px] text-center text-warm-400 mb-4">
              February 18, 2026
            </p>

            {/* Visit notes card */}
            <div className="bg-teal-50 rounded-xl p-3 mb-3 border-l-2 border-teal-500">
              <p className="text-[10px] font-semibold text-warm-700 mb-1">
                Your Visit Notes
              </p>
              <p className="text-[9px] text-warm-600 leading-relaxed">
                Routine cleaning completed. No cavities found! Continue
                flossing daily and brushing 2x per day.
              </p>
            </div>

            {/* Checklist */}
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-warm-700 mb-2">
                Things to Remember
              </p>
              {["Brush 2x daily", "Floss every evening", "Next visit in 6 months"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2 mb-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-teal-400 flex-shrink-0" />
                    <span className="text-[9px] text-warm-600">{item}</span>
                  </div>
                )
              )}
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
