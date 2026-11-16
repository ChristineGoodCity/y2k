import { CollectionGrid } from "../molecules/collection-grid";
import { SectionHeader } from "../molecules/section-header";
import type { Collection } from "@/lib/types";

export function CollectionSection({
  number,
  label,
  sublabel,
  id,
  cards,
}: Collection & { id: string; number: string }) {
  const items = cards.map((card, index) => ({
    title: card.name ?? "",
    model: card.model ?? "",
    cameraOrbit: `${card.angle ?? 0}deg ${card.tilt ?? 75}deg ${card.distance ?? 110}%`,
    number: String(index + 1).padStart(2, "0"),
  }));

  return (
    <section id={id} className="custom-grid py-8 md:py-12">
      <SectionHeader
        number={number}
        label={label ?? "collection"}
        sublabel={sublabel ?? "Icons live on"}
      />
      <CollectionGrid items={items} />
    </section>
  );
}
