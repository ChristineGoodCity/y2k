import type { ReactNode } from "react";

/** Foil lettering activated by its enclosing glitter group. */
export function GlitterText({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block glitter-surface bg-clip-text group-hover/glitter:text-transparent group-focus-within/glitter:text-transparent">
      {children}
    </span>
  );
}
