import React from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {title && (
          <h3 className="text-lg font-semibold mb-4 text-slate-800">{title}</h3>
        )}
        <div className="mb-6 text-slate-600 text-sm">{children}</div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50"
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
