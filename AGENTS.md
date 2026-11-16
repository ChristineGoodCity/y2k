# Component architecture

- Put reusable UI atoms in `src/components/atoms/` and composed UI molecules in `src/components/molecules/`.
- Give each full page section its own file in `src/components/sections/`, such as `intro-section.tsx` or a future `gallery-section.tsx`.
- Keep `src/components/sections.tsx` limited to mapping WordPress section types to components and preserving their order. Section markup and styling belong in the individual components.
- Reuse existing atoms, shared grid, typography, and design tokens. Preserve the original Y2K behavior and appearance when migrating components.

# Prefer native HTML and CSS

- Prefer semantic HTML and CSS (including Tailwind utilities) over JavaScript for layout, responsive behavior, visual states, effects, transitions, and animations. Use native browser features when they meet the requirement.
- Prefer CSS gradients, masks, filters, transforms, and keyframes over canvas, WebGL, JavaScript animation loops, or animation libraries for effects CSS can reasonably express. Use SVG when vector artwork is needed; reserve canvas or WebGL for rendering that requires them.
- Use JavaScript for application logic and interactions CSS cannot handle. When an effect needs pointer coordinates or other runtime input, keep JavaScript limited to supplying state or CSS custom properties, and let CSS render and animate the effect.
- Before introducing JavaScript-driven visuals, canvas, WebGL, or an animation dependency, check whether existing HTML/CSS features can achieve the intended behavior and appearance. If a fallback is necessary, explain the concrete limitation that requires it.

# CSS organization and Tailwind

- Group CSS by category in clearly labeled, contiguous sections: colors and design tokens, global defaults, typography, animations, shared utilities and layout, then component classes.
- Keep all typography utilities (`typo-*`) together, including typography used by only one component. Keep color tokens together. Keep animation definitions, animated `@property` registrations, keyframes, and reduced-motion overrides together in the animations section, with contiguous subgroups in this order: all keyframes, all `@property` registrations, then all reduced-motion overrides.
- Group remaining component classes by component: keep selectors, states, responsive overrides, and surface effects adjacent. Add rules to their existing category or component group instead of appending disconnected blocks. Preserve required top-level at-rule syntax and cascade behavior when regrouping rules.
- Use Tailwind utilities directly in JSX for component styling. Do not create CSS selector classes solely to wrap utilities that belong in the component.
- When writing stylesheet rules or shared utility recipes, use `@apply` for styling declarations, including gradients, masks, shadows, and effects through Tailwind arbitrary values where needed. Keep `@theme` tokens and `@property` descriptors in their native CSS syntax.
- Before delivering CSS changes, check class syntax against the installed Tailwind version and resolve canonical-class suggestions. Prefer canonical utilities such as `bg-size-[...]` and `bg-position-[...]` over equivalent arbitrary properties. Preserve arbitrary properties when no equivalent canonical utility exists.
- Compile the stylesheet with the project's Tailwind/PostCSS setup before delivery and verify that syntax-only changes preserve the generated styles.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
