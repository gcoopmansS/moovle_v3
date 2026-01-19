import { useNavigate } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-16 h-16 rounded-full bg-coral-500 border-4 border-white shadow-md flex items-center justify-center mb-6">
        {IconComponent ? (
          <IconComponent className="text-white" size={24} />
        ) : (
          <span className="text-white text-2xl font-semibold">+</span>
        )}
      </div>

      <h3 className="text-xl font-semibold text-slate-700 mb-3 text-center">
        {title}
      </h3>

      <p className="text-slate-500 mb-8 text-center max-w-md leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
        {primaryAction && (
          <button
            onClick={() => handleAction(primaryAction)}
            className="px-6 py-3 rounded-xl bg-coral-500 text-white font-semibold shadow-sm hover:bg-coral-600 transition-colors"
          >
            {primaryAction.label}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={() => handleAction(secondaryAction)}
            className="px-6 py-3 rounded-xl bg-white border border-coral-500 text-coral-500 font-semibold shadow-sm hover:bg-coral-50 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
