// Minimal walking icon (outline)
export default function Walking({ className }) {
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
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v4l-2 2m2-2l2 2m-2 2v4m-2 2h4" />
    </svg>
  );
}
