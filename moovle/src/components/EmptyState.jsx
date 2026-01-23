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
      <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-6">
        {IconComponent ? (
          <IconComponent className="text-slate-500" size={32} />
        ) : (
          <span className="text-slate-500 text-3xl font-semibold">+</span>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>

      <p className="text-slate-600 mb-6 text-center max-w-sm leading-relaxed text-sm">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs">
        {primaryAction && (
          <button
            onClick={() => handleAction(primaryAction)}
            className={primaryButton.className}
          >
            {primaryAction.label}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={() => handleAction(secondaryAction)}
            className={secondaryButton.className}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
