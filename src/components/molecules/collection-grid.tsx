import {
  CollectionCard,
  type CollectionCardProps,
} from "../atoms/collection-card";

export function CollectionGrid({ items }: { items: CollectionCardProps[] }) {
  return (
    <div className="col-span-full mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item, index) => (
        <CollectionCard key={index} {...item} motionIndex={index} />
      ))}
    </div>
  );
}
