/** Caption with a fixed rule gap and text that wraps beneath the rule. */
export function SectionSublabel({
  label,
  side = "right",
}: {
  label: string;
  side?: "left" | "right";
}) {
  if (!label.trim()) return null;

  return (
    <span className="inline-block min-w-0 max-w-full align-top text-accent typo-section-sublabel wrap-anywhere">
      <span
        aria-hidden="true"
        className={`mt-[0.5lh] w-12 border-t border-accent ${
          side === "left" ? "float-left mr-4" : "float-right ml-4"
        }`}
      />
      {label.trim()}
    </span>
  );
}
