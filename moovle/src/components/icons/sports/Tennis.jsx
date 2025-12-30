// Minimal tennis icon (outline)
export default function Tennis({ className }) {
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
      <ellipse cx="12" cy="12" rx="7" ry="10" />
      <path d="M5 12a7 10 0 0 1 14 0" />
    </svg>
  );
}
