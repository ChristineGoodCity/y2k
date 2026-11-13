# Y2K — WordPress + ACF Pro + Next.js

All page content uses **ACF Pro Flexible Content**. Open a page and choose **Add section → Intro**, **Collection**, or **Gallery**. Edit fields directly on the page and drag section headers to reorder. Inside Collection, use **Add card** to edit each card's name, GLB file, and camera settings, and drag cards to reorder. Gallery cards have an image URL, editable title, accessible description, and image dimensions.

There are no standalone Intro, Collection, or Collection card entries, section relationships, or builder toggle. Every section and card belongs to its page. Removing all sections produces an empty page.

## Try it

- Edit the homepage: http://localhost:8081/wp-admin/post.php?post=4&action=edit
- Manage fields: **ACF → Field Groups → Page builder**.
- Edit header links: **Site settings → Header navigation**. Add links and drag rows to reorder. Its field definitions are under **ACF → Field Groups → Header navigation**.
- Configure the Site settings screen: **ACF → Options Pages → Site settings**.
- Configure the search-description field: **ACF → Field Groups → Page settings**.
- Save with **Publish/Update**, then open the website.

## Running locally

Open Docker Desktop, then:

```sh
npm install
npm run wp:setup
npm run dev
```

Later starts: `npm run wp:up` followed by `npm run dev`.

- Website: http://localhost:3000
- CMS: http://localhost:8081/wp-admin
- Login: `y2k-admin`; password is `WP_ADMIN_PASSWORD` in `.env`.

Environment files are ignored by Git. `npm run wp:down` preserves database volumes. The original `../y2k` project is unchanged.

## Published content

Pages use the classic WordPress screen with native ACF controls. Next.js displays published pages only. Publish or update content to see it on the website; draft previews are not provided. Changes to one page do not change another page.

## Code organization

- `src/components/atoms`: star, section label, collector card, model viewer.
- `src/components/molecules`: header and intro panel.
- `src/components/sections`: complete visual sections.
- `src/components/sections.tsx`: maps incoming section types to components.
- `src/lib/wordpress.ts`: server-only REST loader for page-owned sections and cards; preserves order.
- `scripts/setup-page-builder.php`: installs the CMS-managed field group from `wordpress/y2k-headless/page-builder.json` once.

Field definitions and content live in the WordPress database. The JSON schema supplies defaults for new installations; setup preserves later CMS field edits. Back up the database and uploads when moving hosts. Changing field labels is safe; changing field names requires updating the data loader and migrating content. New section designs need a Next.js component and a loader mapping.

## Checks

```sh
npm run typecheck
npm run build
node scripts/check-integration.mjs
```

## Hosting later

Use Node-compatible hosting for Next.js and PHP/MySQL hosting for WordPress. Install ACF Pro, WPGraphQL and this plugin; migrate database/uploads. Set `WORDPRESS_GRAPHQL_URL` on Next.js. Use HTTPS. Docker credentials are local-development credentials only.

ACF field groups used by the frontend have **Show in REST API** enabled. Page content uses the standard WordPress REST API; WPGraphQL currently remains only for the site title and navigation. Requests are deduplicated within a render, while saved CMS changes stay fresh between visits.

ACF layout fields match React section props directly (for example `heading` and `cards`). `sections.tsx` selects the typed component by `acf_fc_layout`. The loader validates fields and normalizes model URLs; camera formatting lives in Collection. Existing installations run `scripts/simplify-builder-fields.php` once through setup to rename fields while preserving saved content.

`setup-site-settings.php` installs the database-managed ACF options page and Page settings group once. Their existing keys and option storage are preserved; subsequent setup runs leave admin changes intact. The runtime plugin only handles editor behavior, model uploads, site-data delivery.

## Standalone Vercel preview

The saved preview in `src/data/preview.json` renders with the same components as WordPress. Without `WORDPRESS_GRAPHQL_URL`, the app uses this snapshot automatically. Set `CONTENT_SOURCE=snapshot` to force it, or `CONTENT_SOURCE=wordpress` to require the live CMS.

To refresh the preview after editing WordPress (Node 22.18+):

```sh
npm run preview:export
CONTENT_SOURCE=snapshot npm run build
```

The exporter reads published, unprotected pages and navigation, reuses byte-identical files already in `public/` and copies only distinct WordPress uploads into `public/preview-assets/`, and validates referenced local files. It replaces the snapshot only after a successful export. Existing assets in `public/` (gallery images, models, textures, viewer scripts, and environments) are also required.

Commit the generated JSON and assets with the code, then redeploy Vercel. No WordPress service or credentials are needed for snapshot mode. Changes in WordPress do not reach this preview until you export and redeploy again. Keep `WORDPRESS_GRAPHQL_URL` in `.env.local` for normal local editing.
