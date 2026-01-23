import { useNavigate } from "react-router-dom";
import { primaryButton, secondaryButton } from "./ui/styles";

export default function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon: IconComponent,
}) {
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (action?.onClick) {
      action.onClick();
    } else if (action?.to) {
      navigate(action.to);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6">
      <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
        {IconComponent ? (
          <IconComponent className="text-slate-500" size={32} />
        ) : (
          <span className="text-slate-500 text-3xl font-semibold">+</span>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-center text-slate-800">
        {title}
      </h3>

      <p className="text-slate-500 mb-8 text-center max-w-sm leading-relaxed text-sm">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs">
        {primaryAction && (
          <button
            onClick={() => handleAction(primaryAction)}
            className="px-5 py-2 h-10 rounded-xl font-medium text-sm text-white bg-teal-500 hover:bg-teal-600 cursor-pointer transition-all duration-200 transform hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
          >
            {primaryAction.label}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={() => handleAction(secondaryAction)}
            className="px-5 py-2 h-10 rounded-xl font-medium text-sm border border-teal-400 text-teal-600 bg-white hover:bg-teal-50 cursor-pointer transition-all duration-200 transform hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
