interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="w-[280px] h-[560px] rounded-[36px] border-[3px] border-warm-800 bg-white shadow-lg overflow-hidden relative flex-shrink-0">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-warm-800 rounded-b-xl z-10" />
      {/* Screen content — scaled down from 480px */}
      <div className="w-[480px] h-[960px] origin-top-left overflow-y-auto" style={{ transform: "scale(0.583)", transformOrigin: "top left" }}>
        <div className="pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
