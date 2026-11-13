import { GlitterBorder } from "./glitter-border";
import { GlitterText } from "./glitter-text";
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
    <figure className="group/glitter relative isolate min-w-0 border-frame">
      <Image
        src={image}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 33vw"
        className="block h-auto w-full rounded-t-[7px]"
        unoptimized
      />
      {title && (
        <figcaption className="typo-section-sublabel px-3 py-2 text-accent wrap-break-word">
          <GlitterText>{title}</GlitterText>
        </figcaption>
      )}
      <GlitterBorder />
    </figure>
  );
}
