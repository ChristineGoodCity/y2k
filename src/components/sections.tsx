import type { Section } from "@/lib/types";
import { IntroSection } from "./sections/intro-section";
import { CollectionSection } from "./sections/collection-section";

import { GallerySection } from "./sections/gallery-section";

/** Render page layouts with section numbers derived from their page order. */
export function Sections({ sections }: { sections: Section[] }) {
  return sections.map((section, index) => {
    const id = section.anchor || `section-${index}`;
    const number = String(index + 1);
    switch (section.acf_fc_layout) {
      case "intro":
        return (
          <IntroSection key={index} {...section} id={id} number={number} />
        );
      case "gallery":
        return (
          <GallerySection key={index} {...section} id={id} number={number} />
        );
      case "collection":
        return (
          <CollectionSection key={index} {...section} id={id} number={number} />
        );
    }
  });
}
