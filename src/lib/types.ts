type SectionFields = {
  anchor?: string;
  number?: string;
  label?: string;
  sublabel?: string;
};
export type Intro = SectionFields & {
  acf_fc_layout: "intro";
  heading?: string;
  description?: string;
  tags?: string;
  title?: string;
  model?: string;
  model_alt?: string;
  collector_enabled?: boolean;
  collector_anchor?: string;
  collector_brand?: string;
  collector_title?: string;
  collector_motto?: string;
  collector_number?: string;
  collector_footer?: string;
};
export type CollectionCard = {
  name?: string;
  model?: string;
  angle?: number;
  tilt?: number;
  distance?: number;
};
export type Collection = SectionFields & {
  acf_fc_layout: "collection";
  cards: CollectionCard[];
};
export type GalleryCard = {
  title: string;
  image: string;
  alt: string;
  width: number;
  height: number;
};
export type Gallery = SectionFields & {
  acf_fc_layout: "gallery";
  cards: GalleryCard[];
};
export type Section = Intro | Collection | Gallery;
export type Page = {
  id: number;
  title: string;
  uri: string;
  description: string;
  sections: Section[];
};
export type Site = { title: string; links: { title: string; url: string }[] };
