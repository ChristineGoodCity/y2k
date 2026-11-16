import { GlitterBorder } from "./glitter-border";
import { HolographicText } from "./holographic-text";
import Image from "next/image";
import type { GalleryCard as GalleryCardProps } from "@/lib/types";

export function GalleryCard({
  image,
  alt,
  title,
  width,
  height,
}: GalleryCardProps) {
  return (
    <figure className="group/holographic relative isolate min-w-0 border-frame">
      <Image
        src={image}
        alt={alt}
        width={width}
        height={height}
        className="block h-auto w-full rounded-t-[7px]"
        unoptimized
      />
      {title && (
        <figcaption className="typo-section-sublabel px-3 py-2 text-accent wrap-break-word">
          <HolographicText>{title}</HolographicText>
        </figcaption>
      )}
      <GlitterBorder />
    </figure>
  );
}
