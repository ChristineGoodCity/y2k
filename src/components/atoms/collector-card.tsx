"use client";
import { useEffect, useRef } from "react";
import { Star } from "./star";
export function CollectorCard({
  attributes: a,
}: {
  attributes: Record<string, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    const surface = card?.parentElement;

    if (!card || !surface) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const current = { x: 0.5, y: 0.5, active: 0 };
    const target = { ...current };
    const render = () => {
      let moving = false;
      for (const key of ["x", "y", "active"] as const) {
        const delta = target[key] - current[key];
        current[key] += delta * 0.16;
        if (Math.abs(delta) > 0.001) moving = true;
        else current[key] = target[key];
      }
      const { x, y, active } = current;
      card.style.transform = `rotateX(${-(y - 0.5) * 14}deg) rotateY(${(x - 0.5) * 18}deg)`;
      card.style.setProperty("--shine-x", `${x * 100}%`);
      card.style.setProperty("--shine-y", `${y * 100}%`);
      // Reflection gains strength toward grazing angles, rather than switching on.
      const angle = Math.min(1, Math.hypot(x - 0.5, y - 0.5) * 1.8);
      card.style.setProperty(
        "--foil-intensity",
        `${0.12 + active * (0.35 + angle * 0.4)}`,
      );
      card.style.setProperty("--shine-opacity", `${0.15 + active * 0.5}`);
      frame = moving ? requestAnimationFrame(render) : 0;
    };
    const animate = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const reset = () => {
      target.x = target.y = 0.5;
      target.active = 0;
      if (motion.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        Object.assign(current, target);
        render();
      } else animate();
    };
    const tilt = (event: PointerEvent) => {
      if (motion.matches || event.pointerType === "touch") return;
      // Measure the stationary wrapper so the tilt cannot shift its own input.
      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      target.x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width),
      );
      target.y = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height),
      );
      target.active = 1;
      animate();
    };

    surface.addEventListener("pointermove", tilt);
    surface.addEventListener("pointerleave", reset);
    surface.addEventListener("pointercancel", reset);
    motion.addEventListener("change", reset);

    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener("pointermove", tilt);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointercancel", reset);
      motion.removeEventListener("change", reset);
    };
  }, []);

  return (
    <div data-collector-card className="perspective-midrange @container">
      <div
        ref={ref}
        className="collector-card relative isolate aspect-[2.85] w-full overflow-hidden rounded-[2.8cqw] px-[4%] py-[3.5%] text-canvas"
      >
        <span className="collector-card__foil" aria-hidden="true" />
        <span className="collector-card__glitter" aria-hidden="true" />
        <span className="collector-card__stars" aria-hidden="true" />
        <div className="relative z-1">
          <p className="typo-collector-wordmark mb-[0.8cqw] italic">
            {a.brand}
          </p>
          <p className="typo-collector-label">{a.title}</p>
          <p className="mt-[3.4cqw] typo-collector-micro whitespace-pre-line">
            {a.motto}
          </p>
        </div>
        <p className="absolute bottom-[12%] left-[4%] z-1 typo-collector-label">
          {a.number}
        </p>
        <svg
          className="absolute top-[24%] right-[15%] w-[47%] text-line opacity-65"
          viewBox="0 0 500 220"
          fill="none"
          aria-hidden="true"
        >
          <g
            transform="rotate(-20 250 110)"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            {[240, 118, 42].map((rx) => (
              <ellipse key={rx} cx="250" cy="110" rx={rx} ry="64" />
            ))}
            <ellipse cx="250" cy="110" rx="240" ry="24" />
          </g>
        </svg>
        <span
          className="absolute top-[9%] right-[4%] aspect-square w-[7%] rounded-full border-2 border-current after:content-[''] after:absolute after:inset-[0.7cqw] after:border after:border-current after:rounded-full"
          aria-hidden="true"
        />
        <Star className="absolute top-[48%] right-[4%] w-[6%]" />
        <p className="absolute right-[4%] bottom-[12%] z-1 text-right typo-collector-micro whitespace-pre-line">
          {a.footer}
        </p>
      </div>
    </div>
  );
}
