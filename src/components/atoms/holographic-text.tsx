import type { ComponentPropsWithoutRef } from "react";

type HolographicTextProps =
  | (ComponentPropsWithoutRef<"a"> & { href: string })
  | (ComponentPropsWithoutRef<"span"> & { href?: never });

/** Shared foil lettering for links and text inside glitter groups. */
export function HolographicText(props: HolographicTextProps) {
  const textClassName =
    "inline-block bg-clip-text holographic-surface group-hover/holographic:text-transparent group-focus-within/holographic:text-transparent";

  if (props.href !== undefined) {
    const { className = "", children, ...linkProps } = props;
    return (
      <a
        {...linkProps}
        className={`group/holographic inline-block text-accent no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${className}`}
      >
        <span className={textClassName}>{children}</span>
      </a>
    );
  }

  const { className = "", children, ...textProps } = props;
  return (
    <span {...textProps} className={`${textClassName} ${className}`}>
      {children}
    </span>
  );
}
