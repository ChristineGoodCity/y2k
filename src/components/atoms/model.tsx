"use client";
import { createElement } from "react";
import Script from "next/script";
export function Model({
  attributes: a,
  className,
  cameraOrbit,
}: {
  attributes: Record<string, string>;
  className?: string;
  cameraOrbit?: string;
}) {
  const orbit = cameraOrbit?.trim();
  const distance = orbit?.split(/\s+/)[2];

  return (
    <>
      <Script src="/vendor/model-viewer.min.js" type="module" />
      {createElement("model-viewer", {
        src: /^(https?:\/\/|\/)/.test(a.model) ? a.model : `/models/${a.model}`,
        alt: a.alt,
        "camera-controls": "",
        "camera-orbit": orbit || undefined,
        // Keep the saved radius from being clamped by the viewer defaults.
        "min-camera-orbit": distance ? `auto 0deg ${distance}` : undefined,
        "max-camera-orbit": distance ? `auto 180deg ${distance}` : undefined,
        "interaction-prompt": "none",
        "disable-zoom": "",
        "disable-pan": "",
        "touch-action": "pan-y",
        loading: "lazy",
        "environment-image": "/environments/heart-studio-gloss.hdr",
        className,
        style: { width: "100%", height: className ? "100%" : "420px" },
      })}
    </>
  );
}
