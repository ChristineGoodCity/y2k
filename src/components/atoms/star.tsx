export function Star({
  className = "size-5 shrink-0 text-accent",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C13.5 9.5 14.5 10.5 24 12C14.5 13.5 13.5 14.5 12 24C10.5 14.5 9.5 13.5 0 12C9.5 10.5 10.5 9.5 12 0Z" />
    </svg>
  );
}
