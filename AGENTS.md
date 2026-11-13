# Component architecture

- Put reusable UI atoms in `src/components/atoms/` and composed UI molecules in `src/components/molecules/`.
- Give each full page section its own file in `src/components/sections/`, such as `intro-section.tsx` or a future `gallery-section.tsx`.
- Keep `src/components/sections.tsx` limited to mapping WordPress section types to components and preserving their order. Section markup and styling belong in the individual components.
- Reuse existing atoms, shared grid, typography, and design tokens. Preserve the original Y2K behavior and appearance when migrating components.

# CSS organization and Tailwind

- Order styles from global to specific: design tokens, global defaults, shared utilities and typography, shared layout, then component-specific styles and effects. Keep component-specific properties and motion overrides with their component near the bottom.
- Group related CSS by ownership in clearly labeled, contiguous sections. Keep shared typography utilities (`typo-*`) together; keep typography used only by one component together within that component's section.
- Keep all stylesheet definitions for a component or feature in one place: its typography, custom properties and `@property` registrations, selectors, states, responsive overrides, effects, keyframes, and reduced-motion overrides. For example, all collector-card CSS belongs in the collector-card section. Apply this organization to every component and feature, and add new rules to the existing group instead of appending disconnected blocks elsewhere. Preserve required top-level at-rule syntax and cascade behavior when grouping rules.
- Use Tailwind utilities directly in JSX for component styling. Do not create CSS selector classes solely to wrap utilities that belong in the component.
- When writing stylesheet rules or shared utility recipes, use `@apply` for styling declarations, including gradients, masks, shadows, and effects through Tailwind arbitrary values where needed. Keep `@theme` tokens and `@property` descriptors in their native CSS syntax.
- Before delivering CSS changes, check class syntax against the installed Tailwind version and resolve canonical-class suggestions. Prefer canonical utilities such as `bg-size-[...]` and `bg-position-[...]` over equivalent arbitrary properties. Preserve arbitrary properties when no equivalent canonical utility exists.
- Compile the stylesheet with the project's Tailwind/PostCSS setup before delivery and verify that syntax-only changes preserve the generated styles.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
