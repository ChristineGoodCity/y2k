import { GalleryGrid } from "../molecules/gallery-grid";
import { SectionHeader } from "../molecules/section-header";
import type { Gallery } from "@/lib/types";

export function GallerySection({
  number,
  label,
  sublabel,
  id,
  cards,
}: Gallery & { id: string; number: string }) {
  return (
    <section id={id} className="custom-grid py-8 md:py-12">
      <SectionHeader
        number={number}
        label={label || "gallery"}
        sublabel={sublabel}
      />
      <GalleryGrid items={cards} />
    </section>
  );
}
