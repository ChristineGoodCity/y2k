import { GlitterBorder } from "./glitter-border";
import { HolographicText } from "./holographic-text";
import type { CSSProperties } from "react";
import { Model } from "./model";

export type CollectionCardProps = {
  number: string;
  title: string;
  model?: string;
  cameraOrbit?: string;
};

/** A framed collection item accepting a GLB filename or URL. */
export function CollectionCard({
  number,
  title,
  model,
  cameraOrbit,
  motionIndex = 0,
}: CollectionCardProps & { motionIndex?: number }) {
  return (
    <figure className="group/holographic relative isolate flex min-w-0 flex-col border-frame">
      <div className="aspect-square min-w-0 overflow-hidden rounded-t-[7px] p-2">
        {model ? (
          <div
            className="h-full motion-safe:animate-[collection-float_7s_ease-in-out_infinite] active:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
            style={
              {
                "--float-x": `${[2, -3, 1, -2, 3][motionIndex % 5]}px`,
                "--float-y": `${[4, 6, 3, 5, 7][motionIndex % 5]}px`,
                "--float-tilt": `${[2, -1.5, 3, -2.5, 1][motionIndex % 5]}deg`,
                animationDuration: `${7 + (motionIndex % 5) * 0.65}s`,
                animationDirection: motionIndex % 2 ? "reverse" : "normal",
                animationDelay: `${-motionIndex * 1.7}s`,
              } as CSSProperties
            }
          >
            <Model
              loadingStatic
              attributes={{ model, alt: title }}
              cameraOrbit={cameraOrbit}
              className="block"
            />
          </div>
        ) : (
          <div
            className="flex h-full items-center justify-center text-accent"
            role="img"
            aria-label={`${title} — model coming soon`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              className="size-1/2"
              fill="none"
              stroke="currentColor"
            >
              <path d="m50 8 10 31 33 1-26 20 9 32-26-19-26 19 9-32L7 40l33-1Z" />
            </svg>
          </div>
        )}
      </div>
      <figcaption className="mt-auto flex items-baseline gap-5 px-3 pb-2 text-accent">
        <span className="typo-section-number shrink-0">
          <HolographicText>{number}</HolographicText>
        </span>
        <span className="typo-section-sublabel min-w-0 wrap-break-word">
          <HolographicText>{title}</HolographicText>
        </span>
      </figcaption>
      <GlitterBorder />
    </figure>
  );
}
