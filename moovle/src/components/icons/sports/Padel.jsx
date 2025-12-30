// Minimal padel icon (outline)
export default function Padel({ className }) {
  return (
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
}
