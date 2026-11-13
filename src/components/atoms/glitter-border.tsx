/** A masked foil outline; leaves card content and pointer interactions untouched. */
export function GlitterBorder() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -inset-px z-10 rounded-[inherit] p-px glitter-surface [mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] [mask-clip:content-box,border-box] mask-exclude opacity-0 group-hover/glitter:opacity-100 group-focus-within/glitter:opacity-100"
    />
  );
}
