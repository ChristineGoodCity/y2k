import { GlitterText } from "./glitter-text";
import type { ComponentPropsWithoutRef } from "react";

export function GlitterLink({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...props}
      className={`group/glitter inline-block text-accent no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${className}`}
    >
      <GlitterText>{children}</GlitterText>
    </a>
  );
}
