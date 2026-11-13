import "server-only";
import snapshot from "@/data/preview.json";
import type { Page, Site } from "./types";

// Local editing uses WordPress; deployments without a CMS use the saved preview.
const useSnapshot =
  process.env.CONTENT_SOURCE === "snapshot" ||
  (!process.env.WORDPRESS_GRAPHQL_URL &&
    process.env.CONTENT_SOURCE !== "wordpress");
const preview = snapshot as { site: Site; pages: Record<string, Page> };

export async function getPage(uri: string): Promise<Page | null> {
  if (useSnapshot) return preview.pages[uri.replace(/\/+$/, "") || "/"] ?? null;
  return (await import("./wordpress")).getPage(uri);
}

export async function getSite(): Promise<Site> {
  if (useSnapshot) return preview.site;
  return (await import("./wordpress")).getSite();
}
