import React from "react";

export const Running = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6v4l-2 2m2-2l2 2m-2 2v4m-2 2h4" />
  </svg>
);

export const Cycling = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="7" cy="17" r="3" />
    <circle cx="17" cy="17" r="3" />
    <path d="M7 17l5-8 5 8M12 9V5m0 0h2m-2 0H10" />
  </svg>
);

export const Walking = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6v4l-2 2m2-2l2 2m-2 2v4m-2 2h4" />
  </svg>
);

export const Tennis = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="12" cy="12" rx="7" ry="10" />
    <path d="M5 12a7 10 0 0 1 14 0" />
  </svg>
);

export const Padel = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="8" cy="8" r="4" />
    <rect x="14" y="14" width="6" height="6" rx="2" />
    <path d="M12 12l4 4" />
  </svg>
);

export const sportIcons = {
  running: Running,
  cycling: Cycling,
  walking: Walking,
  tennis: Tennis,
  padel: Padel,
};

export function getSportIconComponent(id) {
  return sportIcons[id] || Running;
}
