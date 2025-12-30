// Minimal cycling icon (outline)
export default function Cycling({ className }) {
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
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M7 17l5-8 5 8M12 9V5m0 0h2m-2 0H10" />
    </svg>
  );
}
