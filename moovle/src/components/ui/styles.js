/**
 * Moovle UI Component Styles
 * Modern button, chip, and interactive element styling patterns
 */

// Primary Button - Solid teal with active styling
export const primaryButton = {
  base: "px-6 py-3 rounded-xl font-semibold text-white cursor-pointer transition-all duration-200 transform",
  style: "bg-teal-500 hover:bg-teal-600",
  hover: "hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]",
  active: "active:translate-y-0.5 active:scale-[0.96] active:shadow-sm",
  disabled:
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
  get className() {
    return `${this.base} ${this.style} ${this.hover} ${this.active} ${this.disabled}`;
  },
};

// Secondary Button - Teal outline style
export const secondaryButton = {
  base: "px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 transform",
  style:
    "border-2 border-teal-500 text-teal-600 bg-surface hover:bg-teal-500 hover:text-white",
  hover: "hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02]",
  active: "active:translate-y-0.5 active:scale-[0.96] active:shadow-sm",
  disabled:
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
  get className() {
    return `${this.base} ${this.style} ${this.hover} ${this.active} ${this.disabled}`;
  },
};

// Compact Secondary Button (for smaller spaces)
export const compactSecondaryButton = {
  base: "px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 transform",
  style:
    "border border-teal-500 text-teal-600 bg-surface hover:bg-teal-500 hover:text-white",
  hover: "hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02]",
  active: "active:translate-y-0.5 active:scale-[0.96] active:shadow-sm",
  disabled:
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
  get className() {
    return `${this.base} ${this.style} ${this.hover} ${this.active} ${this.disabled}`;
  },
};

// Chips/Pills - Selected and unselected states
export const chip = {
  base: "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer transform whitespace-nowrap",
  unselected:
    "bg-white border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm",
  selected:
    "bg-teal-50 text-teal-700 border border-teal-200 shadow-sm hover:shadow-md",
  active: "active:scale-[0.98] active:shadow-sm",
  getClassName(isSelected) {
    return `${this.base} ${isSelected ? this.selected : this.unselected} ${this.active}`;
  },
};

// Compact Chips (for smaller elements)
export const compactChip = {
  base: "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer transform whitespace-nowrap",
  unselected:
    "bg-surface border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.02]",
  selected:
    "bg-teal-100 text-teal-700 shadow-sm hover:shadow-md hover:scale-[1.02]",
  active: "active:scale-95",
  getClassName(isSelected) {
    return `${this.base} ${isSelected ? this.selected : this.unselected} ${this.active}`;
  },
};

// Danger Button (for destructive actions)
export const dangerButton = {
  base: "px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 transform",
  style: "bg-red-500 text-white hover:bg-red-600",
  hover: "hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]",
  active: "active:translate-y-0 active:scale-[0.98] active:shadow-md",
  disabled:
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
  get className() {
    return `${this.base} ${this.style} ${this.hover} ${this.active} ${this.disabled}`;
  },
};

// Navigation Item (for sidebar/nav elements)
export const navItem = {
  base: "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer transform",
  inactive: "text-slate-600 hover:bg-gray-50 hover:text-slate-700",
  active: "bg-teal-100 text-teal-700",
  hover: "hover:shadow-sm hover:-translate-y-0.5",
  getClassName(isActive) {
    return `${this.base} ${isActive ? this.active : `${this.inactive} ${this.hover}`}`;
  },
};

// Utility function to combine class strings
export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
