import {
  mkdir,
  writeFile,
  rename,
  access,
  readdir,
  readFile,
} from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";
import { createHash } from "node:crypto";
import nextEnv from "@next/env";
import { parsePage } from "../src/lib/wordpress-content.ts";

nextEnv.loadEnvConfig(process.cwd());
const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
if (!endpoint) throw new Error("Set WORDPRESS_GRAPHQL_URL before exporting.");
const origin = new URL(endpoint).origin;
const publicRoot = resolve("public");
const assets = new Map();
// Index original public assets by content, not by filename or WordPress URL.
const existingAssets = new Map();
async function indexAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (file !== resolve(publicRoot, "preview-assets"))
        await indexAssets(file);
    } else if (entry.isFile()) {
      const bytes = await readFile(file);
      const hash = createHash("sha256").update(bytes).digest("hex");
      const path =
        "/" +
        file
          .slice(publicRoot.length + 1)
          .split("/")
          .map(encodeURIComponent)
          .join("/");
      existingAssets.set(hash, path);
    }
  }
}
await indexAssets(publicRoot);

async function request(url, options) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok)
    throw new Error(`Export request failed (${response.status}): ${url}`);
  return response;
}
async function saveAsset(value, model = false) {
  if (!value) return value;
  let path = value;
  if (!/^(https?:\/\/|\/)/.test(path))
    path = `${model ? "/models/" : "/"}${path}`;
  if (!/^https?:\/\//.test(path) && !path.startsWith("/wp-content/uploads/")) {
    const file = resolve(
      publicRoot,
      decodeURIComponent(path.split(/[?#]/)[0]).replace(/^\/+/, ""),
    );
    if (!file.startsWith(publicRoot + "/"))
      throw new Error("Invalid asset path");
    await access(file);
    return path;
  }
  const url = new URL(path, origin);
  if (assets.has(url.href)) return assets.get(url.href);
  const extension = extname(url.pathname);
  if (!/^\.[a-z0-9]+$/i.test(extension))
    throw new Error(`Asset has no supported extension: ${url}`);
  const name =
    createHash("sha256").update(url.href).digest("hex").slice(0, 20) +
    extension;
  const local = `/preview-assets/${name}`;
  const response = await request(url);
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const existing = existingAssets.get(hash);
  if (existing) {
    assets.set(url.href, existing);
    return existing;
  }
  await mkdir(resolve(publicRoot, "preview-assets"), { recursive: true });
  await writeFile(resolve(publicRoot, "preview-assets", name), bytes);
  existingAssets.set(hash, local);
  assets.set(url.href, local);
  return local;
}
const pages = {};
for (let page = 1; ; page++) {
  const url = new URL(
    `/wp-json/wp/v2/pages?status=publish&per_page=100&page=${page}&acf_format=standard`,
    origin,
  );
  const response = await request(url);
  const entries = await response.json();
  for (const entry of entries) {
    const parsed = parsePage(entry, endpoint);
    if (!parsed) continue;
    for (const section of parsed.sections) {
      if (section.acf_fc_layout === "intro")
        // IntroSection currently uses this local model rather than the CMS model.
        section.model = await saveAsset("/models/pink-heart-orbit.glb", true);
      if (section.acf_fc_layout === "collection") {
        for (const card of section.cards)
          card.model = await saveAsset(card.model, true);
      }
      if (section.acf_fc_layout === "gallery") {
        for (const card of section.cards)
          card.image = await saveAsset(card.image);
      }
    }
    pages[parsed.uri] = parsed;
  }
  if (page >= Number(response.headers.get("x-wp-totalpages") || 1)) break;
}
if (!pages["/"])
  throw new Error("No published homepage found; previous snapshot preserved.");
const response = await request(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "{ y2kSite }" }),
});
const { data, errors } = await response.json();
if (errors) throw new Error(JSON.stringify(errors));
const site = JSON.parse(data.y2kSite);
for (const link of site.links) {
  if (link.url.startsWith(origin + "/"))
    link.url = link.url.slice(origin.length);
}
const snapshot = { site, pages };
const target = resolve("src/data/preview.json");
await mkdir(dirname(target), { recursive: true });
await writeFile(target + ".tmp", JSON.stringify(snapshot, null, 2) + "\n");
await rename(target + ".tmp", target);
console.log(
  `Exported ${Object.keys(pages).length} published pages and ${assets.size} uploaded assets.`,
);
