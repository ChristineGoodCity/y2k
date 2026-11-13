import { SectionLabel } from "../atoms/section-label";
import { SectionSublabel } from "../atoms/section-sublabel";

export function SectionHeader({
  number,
  label,
  sublabel = "",
}: {
  number: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <header className="col-span-full flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-accent py-5">
      <h2 className="min-w-0 max-w-full">
        <SectionLabel number={number} label={label} />
      </h2>
      <div className="ml-auto max-w-full">
        <SectionSublabel label={sublabel} />
      </div>
    </header>
  );
}
