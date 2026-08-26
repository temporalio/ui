---
name: tailwind-theme
description: Use Temporal UI's property-aware Tailwind color theme correctly. Apply this skill when adding, changing, reviewing, or migrating colors in temporalio/ui or cloud-ui; mapping Figma theme variables to code; choosing semantic background, surface, content, border, interactive, action, or status colors; or fixing audit:tailwind violations.
---

# Tailwind Theme

Use semantic color roles for application UI. Choose tokens by the element's purpose, not by matching the nearest legacy shade.

## Sources of truth

Read these files when the task depends on the exact available tokens or light/dark values:

- `src/lib/theme/io/semantic-colors.ts`: semantic definitions and aliases
- `src/lib/theme/color-api.ts`: property-aware Tailwind exposure
- `scripts/audit-tailwind-colors/index.ts`: enforced legacy and invalid-color rules

When exact Figma alignment is requested, inspect the Figma Theme variable collection if the available MCP tools can access it. Do not rely on remembered names or an old export. If live variables are unavailable, state that limitation and use `semantic-colors.ts` as the code source of truth.

## Choose colors by role

Distinguish roles even when two tokens currently resolve to the same value. Their implementations may diverge later.

- Page or application canvas: `bg-background-primary`
- Standard content surface: `bg-surface-primary`
- Nested or progressively emphasized surfaces: `bg-surface-secondary`, `bg-surface-tertiary`
- Primary, secondary, and muted content: `text-primary`, `text-secondary`, `text-tertiary`
- Brand content: `text-brand`
- Standard separators: `border-primary`; use `border-secondary` or `border-tertiary` only for intentionally stronger boundaries
- Secondary interactive controls: `bg-interactive-secondary`
- Generic hover or pressed feedback over an existing surface: `hover:bg-action-hover-overlay`, `active:bg-action-press-overlay`
- Primary and danger controls: use the matching `bg-interactive-*` base, hover, and press tokens
- Status UI: pair matching roles, such as `bg-surface-information text-information border-information`, and likewise for `success`, `warning`, `danger`, or `error`
- Overlays and translucent status washes: use `bg-overlay-*`

Inspect nearby established components when choosing between similar intents such as `danger` and `error`. Do not decide from hue alone.

## Use property-aware classes

Use the semantic name exposed for the CSS property being styled:

```text
bg-background-primary
bg-surface-primary
bg-interactive-secondary
bg-action-hover-overlay
text-primary
text-information
border-primary
ring-interactive-primary
placeholder:text-tertiary
```

Do not add a group prefix where `color-api.ts` intentionally flattens it. For example, use `text-primary`, not `text-content-primary`, and `border-primary`, not `border-border-primary`.

Avoid legacy compound classes such as `surface-primary` or `surface-information`. Replace every property the compound class supplied, commonly both background and content:

```text
surface-primary     -> bg-surface-primary text-primary
surface-information -> bg-surface-information text-information
surface-subtle      -> bg-surface-tertiary text-secondary
```

Preserve layout, behavior, responsive variants, interaction states, and accessibility while migrating colors.

## Avoid raw colors

Do not use Tailwind default palette classes such as `bg-red-50`, `text-gray-900`, or `dark:bg-slate-900` for application UI. Do not create manual light/dark color pairs when a semantic token represents the intent.

Raw scale colors, fixed black/white, arbitrary values, and direct CSS colors are exceptions, not fallbacks. Use them only when color is intentionally not theme-semantic, for example:

- Static artwork or an asset whose authored color must remain invariant
- Data visualization requiring a categorical scale
- A fixed brand color with no semantic role
- A protocol or third-party color contract

Before retaining an exception, verify that it is intentionally theme-independent. Keep the exception localized; do not introduce a semantic token solely to hide a one-off static asset color.

## Change token definitions carefully

When changing the theme itself:

1. Edit `src/lib/theme/io/semantic-colors.ts` rather than scattering resolved values through components.
2. Preserve meaningful aliases. For example, if one semantic role intentionally aliases another, reuse the same definition instead of duplicating light/dark values.
3. Confirm both light and dark values against the requested design source.
4. Check every usage by semantic role; a value change can affect multiple properties and consumers.
5. Do not change a token definition to solve a single component mismatch if that component is using the wrong role.

## Migration workflow

1. Read the component and determine what each color communicates.
2. Check `semantic-colors.ts`, `color-api.ts`, and nearby established usage when the role is unclear.
3. Replace legacy or raw colors with property-aware semantic classes.
4. If replacing a compound class, restore all of its semantic properties explicitly.
5. Run the Svelte autofixer for every edited `.svelte` file.
6. From the `ui` repository, audit both codebases:

```sh
pnpm audit:tailwind
pnpm audit:tailwind -- ../cloud-ui/src
```

7. Fix every audit violation in the requested scope. Do not silence or weaken the audit to permit a migration.
8. Run the repository-required validation described in its project instructions.

When reviewing incoming or merged code, run both audits across the full repositories rather than checking only conflicted files.
