export function Wordmark({ title }: { title: string }) {
  return (
    <span className="inline-block pr-[0.12em] bg-[url('/textures/foil-glitter.svg'),var(--background-image-collector-foil)] bg-size-[64px_64px,100%_100%] bg-center bg-clip-text text-transparent typo-wordmark">
      {title}
    </span>
  );
}
