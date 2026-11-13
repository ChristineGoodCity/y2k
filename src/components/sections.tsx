import type { Section } from "@/lib/types";
import { IntroSection } from "./sections/intro-section";
import { CollectionSection } from "./sections/collection-section";

import { GallerySection } from "./sections/gallery-section";

/** Render page layouts in their selected order, preserving each layout's props. */
export function Sections({ sections }: { sections: Section[] }) {
  return sections.map((section, index) => {
    const id = section.anchor || `section-${index}`;
    switch (section.acf_fc_layout) {
      case "intro":
        return <IntroSection key={index} {...section} id={id} />;
      case "gallery":
        return <GallerySection key={index} {...section} id={id} />;
      case "collection":
        return <CollectionSection key={index} {...section} id={id} />;
    }
  });
}
