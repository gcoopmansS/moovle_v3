import { X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NudgeCard({
  title,
  description,
  ctaText,
  ctaTo,
  nudgeKey,
  userId,
}) {
  const navigate = useNavigate();

  // Initialize dismissed state from localStorage
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissedNudges = JSON.parse(
      localStorage.getItem(`dismissedNudges_${userId}`) || "{}",
    );
    return dismissedNudges[nudgeKey] || false;
  });

  const handleDismiss = () => {
    setIsDismissed(true);

    // Store dismissal in localStorage
    const dismissedNudges = JSON.parse(
      localStorage.getItem(`dismissedNudges_${userId}`) || "{}",
    );
    dismissedNudges[nudgeKey] = true;
    localStorage.setItem(
      `dismissedNudges_${userId}`,
      JSON.stringify(dismissedNudges),
    );
  };

  const handleCTA = () => {
    navigate(ctaTo);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-slate-50 rounded-xl border border-cyan-100 p-4 mb-6 transition-all duration-300 transform hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-600 mb-3">{description}</p>

          <button
            onClick={handleCTA}
            className="inline-flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.95]"
          >
            {ctaText}
            <ArrowRight size={14} />
          </button>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
