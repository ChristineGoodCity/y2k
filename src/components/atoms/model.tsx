"use client";
import { createElement, useEffect, useRef, useState } from "react";
import Script from "next/script";
function modelSource(model: string) {
  return /^(https?:\/\/|\/)/.test(model) ? model : `/models/${model}`;
}
export function Model({
  attributes: a,
  className,
  cameraOrbit,
  loadingStatic = false,
}: {
  attributes: Record<string, string>;
  className?: string;
  cameraOrbit?: string;
  loadingStatic?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);
  const [readySource, setReadySource] = useState<string>();
  const [failedSource, setFailedSource] = useState<string>();
  const [revealedSource, setRevealedSource] = useState<string>();
  const source = modelSource(a.model);
  const ready = readySource === source;
  const failed = failedSource === source;
  const orbit = cameraOrbit?.trim();
  const distance = orbit?.split(/\s+/)[2];

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    // Lazy src loading still constructs every custom element. Defer the
    // viewer itself, then keep it mounted to preserve the user's camera.
    if (!("IntersectionObserver" in window)) {
      setActivated(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setActivated(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={container}
      className={`relative ${className ?? ""}`}
      aria-busy={!ready && !failed}
      style={{ width: "100%", height: className ? "100%" : "420px" }}
    >
      {activated && (
        <Script
          src="/vendor/model-viewer.min.js"
          type="module"
          strategy="lazyOnload"
          onError={() => setFailedSource(source)}
        />
      )}
      {activated &&
        createElement("model-viewer", {
          key: source,
          ref: (viewer: HTMLElement | null) => {
            if (!viewer) return;
            const onLoad = () => setReadySource(source);
            const onError = () => setFailedSource(source);
            viewer.addEventListener("load", onLoad);
            viewer.addEventListener("error", onError);
            return () => {
              viewer.removeEventListener("load", onLoad);
              viewer.removeEventListener("error", onError);
            };
          },
          src: source,
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
          style: { display: "block", width: "100%", height: "100%" },
        })}
      {loadingStatic && !failed && revealedSource !== source && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-10 bg-black transition-opacity duration-700 ease-out ${ready ? "opacity-0" : "opacity-100"}`}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && ready)
              setRevealedSource(source);
          }}
        >
          <div className="absolute inset-0 bg-[url('/model-loading-static.gif')] bg-cover bg-center" />
        </div>
      )}
      {!ready && (
        <span
          role="status"
          className={
            failed
              ? "absolute inset-0 flex items-center justify-center text-center text-accent"
              : "sr-only"
          }
        >
          {failed ? "Model couldn't load." : `Loading ${a.alt || "3D model"}…`}
        </span>
      )}
    </div>
  );
}
