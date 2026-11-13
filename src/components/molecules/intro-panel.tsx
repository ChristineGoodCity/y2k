import { Star } from "../atoms/star";

export function IntroPanel({
  heading,
  description,
  tags,
}: {
  heading: string;
  description: string;
  tags: string;
}) {
  return (
    <div className="col-span-full mt-5 grid grid-cols-subgrid gap-y-5 border-frame p-4 sm:gap-y-6 sm:py-8">
      <div className="col-span-full min-w-0 sm:col-span-4 md:col-span-6 lg:col-span-3">
        <h3 className="typo-heading text-accent">{heading}</h3>
        <p className="mt-4 typo-body whitespace-pre-line">{description}</p>
      </div>
      <div className="col-span-full flex items-center gap-4 self-start justify-self-end text-accent sm:col-span-2 sm:pt-1">
        <Star className="size-10 shrink-0" />
        <p className="typo-label whitespace-pre-line uppercase">{tags}</p>
      </div>
    </div>
  );
}
