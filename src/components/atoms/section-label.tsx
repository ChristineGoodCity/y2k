/** The original Y2K numbered section-label atom. */
export function SectionLabel({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  const trimmedNumber = number.trim();
  const trimmedLabel = label.trim();
  if (!trimmedNumber || !trimmedLabel) return null;

  return (
    <span className="inline-flex max-w-full items-stretch overflow-hidden border-frame text-accent">
      <span className="flex min-w-[41px] shrink-0 items-center justify-center border-r border-accent px-3 py-1 typo-section-number">
        {trimmedNumber}
      </span>
      <span className="flex min-w-0 items-center justify-center px-[18px] py-1 typo-section-label wrap-break-word">
        {trimmedLabel}
      </span>
    </span>
  );
}
