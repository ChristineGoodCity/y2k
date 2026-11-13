import "server-only";
import { cache } from "react";
import type { Page, Site, Section, Intro, CollectionCard } from "./types";
const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
type Entry = {
  id: number;
  type: string;
  link: string;
  title: { rendered: string; raw?: string };
  content?: { protected?: boolean };
  password?: string;
  acf?: Record<string, unknown>;
};

function wordpressUrl(path = "") {
  if (!endpoint)
    throw new Error("Configure WORDPRESS_GRAPHQL_URL in .env.local.");
  return new URL(path || endpoint, endpoint);
}

const rest = cache(async (path: string) => {
  const response = await fetch(wordpressUrl(`/wp-json/wp/v2/${path}`), {
    cache: "no-store",
  });
  if ([401, 403, 404].includes(response.status)) return null;
  const data = await response.json();
  if (data?.code === "rest_post_invalid_page_number") return null;
  if (!response.ok)
    throw new Error(`WordPress responded with ${response.status}`);
  return data;
});

function pagePath(link: string) {
  return new URL(link).pathname.replace(/\/+$/, "") || "/";
}

async function findPage(uri: string): Promise<Entry | null> {
  const target = uri.replace(/\/+$/, "") || "/";
  const slug =
    target === "/"
      ? ""
      : `&slug=${encodeURIComponent(target.split("/").pop()!)}`;
  for (let page = 1; ; page++) {
    const entries: Entry[] | null = await rest(
      `pages?per_page=100&page=${page}${slug}&acf_format=standard`,
    );
    const match = entries?.find((entry) => pagePath(entry.link) === target);
    if (match) return match;
    if (!entries || entries.length < 100) return null;
  }
}

function modelUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  if (!/^https?:\/\//.test(value)) return value;
  const url = new URL(value);
  return url.origin === new URL(endpoint!).origin &&
    url.pathname.startsWith("/wp-content/uploads/")
    ? url.pathname
    : value;
}

export const getPage = cache(async (uri: string): Promise<Page | null> => {
  const page = await findPage(uri);
  if (!page || page.type !== "page" || page.password || page.content?.protected)
    return null;
  return {
    id: page.id,
    title: page.title.raw ?? page.title.rendered.replace(/<[^>]*>/g, ""),
    uri: pagePath(page.link),
    description: String(page.acf?.y2k_description ?? ""),
    sections: getBuilderSections(page.acf?.page_builder),
  };
});

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

function collectionCard(card: Record<string, unknown>): CollectionCard {
  if (!card || typeof card !== "object" || Array.isArray(card))
    throw new Error("Invalid collection card");
  if (card.name != null && typeof card.name !== "string")
    throw new Error("Invalid card name");
  return {
    ...card,
    name: card.name ?? "",
    model: modelUrl(card.model),
    angle: numeric(card.angle),
    tilt: numeric(card.tilt),
    distance: numeric(card.distance),
  };
}

function getBuilderSections(value: unknown): Section[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row): Section[] => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    if (row.acf_fc_layout !== "intro" && row.acf_fc_layout !== "collection" && row.acf_fc_layout !== "gallery")
      return [];
    const { cards, collector_enabled = false, model, ...fields } = row;
    // Text defaults can be numbers in ACF; preserve all other field types.
    for (const [key, value] of Object.entries(fields)) {
      fields[key] =
        value == null ? "" : typeof value === "number" ? String(value) : value;
      if (typeof fields[key] !== "string")
        throw new Error(`Invalid section field: ${key}`);
    }
    if (row.acf_fc_layout === "gallery") {
      return [{
        ...fields,
        acf_fc_layout: "gallery",
        cards: Array.isArray(cards) ? cards.map((card) => ({
          title: typeof card.title === "string" ? card.title : "",
          image: modelUrl(card.image),
          alt: typeof card.alt === "string" ? card.alt : "",
          width: Math.max(1, numeric(card.width) ?? 800),
          height: Math.max(1, numeric(card.height) ?? 600),
        })) : [],
      }];
    }
    if (row.acf_fc_layout === "collection") {
      return [
        {
          ...fields,
          acf_fc_layout: "collection",
          cards: Array.isArray(cards) ? cards.map(collectionCard) : [],
        },
      ];
    }
    if (collector_enabled != null && typeof collector_enabled !== "boolean")
      throw new Error("Invalid collector visibility");
    return [
      {
        ...fields,
        model: modelUrl(model),
        collector_enabled: collector_enabled ?? false,
      } as Intro,
    ];
  });
}

export const getSite = cache(async (): Promise<Site> => {
  const response = await fetch(wordpressUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ y2kSite }" }),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`WordPress responded with ${response.status}`);
  const { data, errors } = await response.json();
  if (errors)
    throw new Error(
      errors.map((error: { message: string }) => error.message).join("; "),
    );
  return JSON.parse(data.y2kSite) as Site;
});
