import "server-only";
import { cache } from "react";
import type { Page, Site } from "./types";
import { parsePage, type Entry } from "./wordpress-content";
const endpoint = process.env.WORDPRESS_GRAPHQL_URL;

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
    const match = entries?.find(
      (entry) =>
        (new URL(entry.link).pathname.replace(/\/+$/, "") || "/") === target,
    );
    if (match) return match;
    if (!entries || entries.length < 100) return null;
  }
}

export const getPage = cache(async (uri: string): Promise<Page | null> => {
  const page = await findPage(uri);
  return parsePage(page, endpoint!);
});

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
