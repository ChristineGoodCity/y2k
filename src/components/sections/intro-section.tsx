import { Model } from "../atoms/model";
import { CollectorCard } from "../atoms/collector-card";
import { IntroPanel } from "../molecules/intro-panel";
import { SectionLabel } from "../atoms/section-label";
import { SectionSublabel } from "../atoms/section-sublabel";
import type { Intro } from "@/lib/types";

export function IntroSection({
  title,
  model_alt,
  number = "",
  label = "",
  heading = "",
  description = "",
  tags = "",
  collector_enabled,
  collector_anchor,
  collector_brand = "",
  collector_title = "",
  collector_motto = "",
  collector_number = "",
  collector_footer = "",
  id,
}: Intro & { id: string }) {
  return (
    <section id={id} className="custom-grid min-h-[680px] py-8 md:py-12">
      <div className="col-span-full mb-8 grid grid-cols-subgrid items-center lg:col-span-7 lg:mb-0 lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-x-4">
        <div className="col-span-2 self-center lg:col-span-1">
          <SectionSublabel
            label={title ?? "Same dreams\nNew world"}
            side="left"
          />
        </div>
        <div className="col-span-4 h-[280px] min-w-0 md:col-span-6 md:h-[420px] lg:col-span-1 lg:h-[500px]">
          <Model
            attributes={{
              model: "/models/pink-heart-orbit.glb?v=ring-diagonal-midpoint-1",
              alt: model_alt || "Interactive pink heart with an orbiting ring",
            }}
            className="block"
          />
        </div>
      </div>
      <div className="col-span-full grid grid-cols-subgrid lg:col-span-5 lg:col-start-8">
        <h2 className="col-span-full">
          <SectionLabel number={number} label={label} />
        </h2>
        <IntroPanel heading={heading} description={description} tags={tags} />
        {collector_enabled && (
          <div
            id={collector_anchor || undefined}
            className="col-span-full mt-5"
          >
            <CollectorCard
              attributes={{
                brand: collector_brand,
                title: collector_title,
                motto: collector_motto,
                number: collector_number,
                footer: collector_footer,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
