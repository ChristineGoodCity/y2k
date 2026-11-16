import { HolographicText } from "./holographic-text";

export function Wordmark({ title }: { title: string }) {
  return (
    <HolographicText className="pr-[0.12em] typo-wordmark">
      {title}
    </HolographicText>
  );
}
