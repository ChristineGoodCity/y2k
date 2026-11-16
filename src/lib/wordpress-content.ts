import type { Page, Section, Intro, CollectionCard } from "./types";
export type Entry = {
  id: number;
  type: string;
  link: string;
  title: { rendered: string; raw?: string };
  content?: { protected?: boolean };
  password?: string;
  acf?: Record<string, unknown>;
};

function pagePath(link: string) {
  return new URL(link).pathname.replace(/\/+$/, "") || "/";
}

function modelUrl(value: unknown, endpoint: string): string {
  if (typeof value !== "string") return "";
  if (!/^https?:\/\//.test(value)) return value;
  const url = new URL(value);
  return url.origin === new URL(endpoint).origin &&
    url.pathname.startsWith("/wp-content/uploads/")
    ? url.pathname
    : value;
}

export function parsePage(page: Entry | null, endpoint: string): Page | null {
  if (!page || page.type !== "page" || page.password || page.content?.protected)
    return null;
  return {
    id: page.id,
    title: page.title.raw ?? page.title.rendered.replace(/<[^>]*>/g, ""),
    uri: pagePath(page.link),
    description: String(page.acf?.y2k_description ?? ""),
    sections: getBuilderSections(page.acf?.page_builder, endpoint),
  };
}
function numeric(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  if (
    !["number", "string"].includes(typeof value) ||
    !Number.isFinite(Number(value))
  ) {
    throw new Error("Invalid card camera value");
  }
  return Number(value);
}

function collectionCard(
  card: Record<string, unknown>,
  endpoint: string,
): CollectionCard {
  if (!card || typeof card !== "object" || Array.isArray(card))
    throw new Error("Invalid collection card");
  if (card.name != null && typeof card.name !== "string")
    throw new Error("Invalid card name");
  return {
    ...card,
    name: card.name ?? "",
    model: modelUrl(card.model, endpoint),
    angle: numeric(card.angle),
    tilt: numeric(card.tilt),
    distance: numeric(card.distance),
  };
}

function getBuilderSections(value: unknown, endpoint: string): Section[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row): Section[] => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    if (
      row.acf_fc_layout !== "intro" &&
      row.acf_fc_layout !== "collection" &&
      row.acf_fc_layout !== "gallery"
    )
      return [];
    const { cards, collector_enabled = false, model, ...fields } = row;
    // Text defaults can be numbers in ACF; preserve all other field types.
    // Section numbers come from page order, including for older CMS entries.
    delete fields.number;
    for (const [key, value] of Object.entries(fields)) {
      fields[key] =
        value == null ? "" : typeof value === "number" ? String(value) : value;
      if (typeof fields[key] !== "string")
        throw new Error(`Invalid section field: ${key}`);
    }
    if (row.acf_fc_layout === "gallery") {
      return [
        {
          ...fields,
          acf_fc_layout: "gallery",
          cards: Array.isArray(cards)
            ? cards.map((card) => ({
                title: typeof card.title === "string" ? card.title : "",
                image: modelUrl(card.image, endpoint),
                alt: typeof card.alt === "string" ? card.alt : "",
                width: Math.max(1, numeric(card.width) ?? 800),
                height: Math.max(1, numeric(card.height) ?? 600),
              }))
            : [],
        },
      ];
    }
    if (row.acf_fc_layout === "collection") {
      return [
        {
          ...fields,
          acf_fc_layout: "collection",
          cards: Array.isArray(cards)
            ? cards.map((card) => collectionCard(card, endpoint))
            : [],
        },
      ];
    }
    if (collector_enabled != null && typeof collector_enabled !== "boolean")
      throw new Error("Invalid collector visibility");
    return [
      {
        ...fields,
        model: modelUrl(model, endpoint),
        collector_enabled: collector_enabled ?? false,
      } as Intro,
    ];
  });
}
