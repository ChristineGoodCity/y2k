import { GalleryCard } from "../atoms/gallery-card";
import type { GalleryCard as GalleryCardProps } from "@/lib/types";

export function GalleryGrid({ items }: { items: GalleryCardProps[] }) {
  return (
    <div className="col-span-full mt-3 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>figure]:mb-4 [&>figure]:break-inside-avoid">
      {items.map((item, index) => (
        <GalleryCard key={index} {...item} />
      ))}
    </div>
  );
}
