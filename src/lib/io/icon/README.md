# Io icons

Each icon is its own component. There is no code generation — adding one is a manual, two-file edit.

## Usage

```svelte
<script lang="ts">
  import { IconAdd, IconChevronDown } from '$lib/io/icon';
</script>

<IconAdd />
<IconAdd class="size-5 text-secondary" />
<IconAdd title="Add workflow" />
```

Icons render at `1.143em`, so they scale with the surrounding text — 16px against the app's 14px body size, 12px in a `text-xs` container. They inherit `color` through `currentColor`. Size is set with attributes, so any sizing class overrides it; reach for one only where the icon has no adjacent text to relate to.

They are decorative by default (`aria-hidden`). Pass `title` — or `aria-label`, which wins when both are given — only when the icon carries meaning no nearby text conveys.

There is no `<Icon name="…" />` lookup. To swap icons on state, use an `{#if}` or a small local map of just those icons — never a map of the whole set, which defeats tree-shaking.

## Preparing an SVG

### 1. Normalise the viewBox to `0 0 16 16`

Required — the wrapper hardcodes it. If the source viewBox differs, bake the transform into the coordinates rather than editing the attribute, which would crop the artwork:

```
scale = 16 / width
x' = (x - minX) * scale
y' = (y - minY) * scale
```

Only safe when the icon is paths. Strokes, `userSpaceOnUse` gradients, `<rect>` and `<circle>` carry their own coordinates and would need transforming too.

### 2. Colour

Monochrome icons use `currentColor` for every fill. Icons whose colour carries meaning — brand marks, status indicators — keep their hex values.

Watch for `fill="white"` inside a `<mask>` or `<clipPath>`: that is machinery, not colour, and counting it makes a monochrome icon look two-colour.

### 3. Drop clip paths that clip nothing

Exporters commonly wrap artwork in a `<clipPath>` whose rect matches either the viewBox or the artwork's own bounds. Both are no-ops — the root `<svg>` already clips to its viewport. Remove the `<clipPath>`, its `<defs>` if now empty, and unwrap the `<g clip-path="…">`. Keep any mask that actually hides something.

### 4. Scope internal ids

SVG ids are document-global, so a hardcoded `id` breaks as soon as the icon renders twice — the second instance's `url(#…)` resolves to the first instance's definition. If the icon needs gradients, masks or filters, scope them:

```svelte
const id = $props.id();
```

```svelte
<path fill="url(#{id}-a)" … />
<defs><linearGradient id="{id}-a" …></defs>
```

`icons/azure-color.svelte` is a worked example.

### 5. Optimise

```sh
npx svgo@3 icon.svg --config svgo.config.mjs
```

```js
// svgo.config.mjs
export default {
  multipass: true,
  js2svg: { pretty: false },
  floatPrecision: 3,
  plugins: [
    { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
  ],
};
```

`removeViewBox: false` is required; the default strips it. This roughly halves the payload.

### 6. Add the component

`icons/<kebab-name>.svelte` — body only, no `<svg>` wrapper:

```svelte
<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path fill="currentColor" d="…" />
</IconSvgWrapper>
```

Annotate with `IconProps`, not an inline `Omit<ComponentProps<typeof IconSvgWrapper>, …>`. The
wrapper's `Props` interface isn't exported, so an inline reference to it can't be named during
declaration emit and `svelte-package` silently skips the `.d.ts` — the icon ships untyped.

Then one line in `index.ts`, alphabetically:

```ts
export { default as IconNewThing } from './icons/new-thing.svelte';
```

The export is `Icon` + PascalCase of the filename. The prefix is required, not stylistic — `import.svg` would otherwise produce `export const import`, a syntax error.

### 7. Verify

```sh
pnpm check && pnpm lint
```

Then open `Io/Icon → Contact Sheet` in Storybook. It lists every export, so a new icon appears once the barrel line exists.
