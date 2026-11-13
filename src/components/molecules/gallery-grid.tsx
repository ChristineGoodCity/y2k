import { GalleryCard } from "../atoms/gallery-card";
import type { GalleryCard as GalleryCardProps } from "@/lib/types";

export function GalleryGrid({ items }: { items: GalleryCardProps[] }) {
  return (
    <div className="col-span-full mt-3 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <GalleryCard key={index} {...item} />
      ))}
    </div>
  );
}
