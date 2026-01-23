import React from "react";
import { secondaryButton, primaryButton } from "./ui/styles";

export default function Modal({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-all duration-300">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in-0 zoom-in-95">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="mb-6 text-text-body text-sm">{children}</div>
        <div className="flex gap-2 justify-end">
          <button
            className={`${secondaryButton.className} text-sm py-2 px-4`}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`${primaryButton.className} text-sm py-2 px-4`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Removing..." : confirmLabel || "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
