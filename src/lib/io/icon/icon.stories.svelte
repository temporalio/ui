<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import IconSvgWrapper from './icon-svg-wrapper.svelte';

  const { Story } = defineMeta({
    title: 'Io/Icon',
    component: IconSvgWrapper,
    argTypes: {
      title: { name: 'Accessible label', control: 'text' },
      class: { table: { disable: true } },
      children: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  import type { Component } from 'svelte';

  import * as icons from './index';

  const glyphs = Object.entries(icons)
    .filter(([name]) => name !== 'default')
    .sort(([a], [b]) => a.localeCompare(b)) as [string, Component][];

  const byName = icons as unknown as Record<string, Component>;

  const optical = glyphs
    .filter(([name]) => name.endsWith('Optical'))
    .map(([name, Glyph]) => {
      const baseName = name.slice(0, -'Optical'.length);
      return { name, baseName, Glyph, Base: byName[baseName] };
    })
    .filter(({ Base }) => Boolean(Base))
    .sort((a, b) => a.baseName.localeCompare(b.baseName));

  const sizes = [16, 20, 48];
</script>

<Story name="Contact Sheet">
  {#snippet template()}
    <div class="text-primary">
      <p class="mb-4 text-sm opacity-60">{glyphs.length} icons</p>
      <ul
        class="grid list-none grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2 p-0"
      >
        {#each glyphs as [name, Glyph] (name)}
          <li
            class="surface-primary flex flex-col items-center gap-2 rounded-lg border border-subtle p-3 text-center"
          >
            <span class="text-2xl"><Glyph /></span>
            <code class="break-all text-[0.625rem] leading-tight opacity-70">
              {name}
            </code>
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}
</Story>

<Story name="Optical Adjustments">
  {#snippet template()}
    <div class="text-primary">
      <p class="mb-4 max-w-prose text-sm opacity-60">
        Some Io glyphs fill their viewBox where the icons they replaced were
        inset, so they read larger at the same box size. An optical variant
        nests the base icon in a smaller viewport, leaving the box — and so the
        surrounding layout — untouched. The dotted outline is the box.
      </p>
      <p class="mb-4 text-sm opacity-60">{optical.length} adjusted</p>
      <ul class="flex list-none flex-col gap-3 p-0">
        {#each optical as { name, baseName, Glyph, Base } (name)}
          <li
            class="surface-primary flex flex-col gap-3 rounded-lg border border-subtle p-4"
          >
            <code class="text-xs opacity-70">{baseName}</code>
            <div class="flex flex-wrap items-end gap-6">
              {#each sizes as size (size)}
                <div class="flex items-end gap-3">
                  {#each [{ label: 'base', Component: Base }, { label: 'optical', Component: Glyph }] as variant (variant.label)}
                    {@const Rendered = variant.Component}
                    <div class="flex flex-col items-center gap-1">
                      <span class="outline-danger outline-dotted outline-1">
                        <Rendered width={size} height={size} />
                      </span>
                      <span class="text-[0.625rem] opacity-60">
                        {variant.label}
                      </span>
                    </div>
                  {/each}
                  <span class="text-[0.625rem] opacity-40">{size}px</span>
                </div>
              {/each}
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm">
              {#each [{ label: baseName, Component: Base }, { label: name, Component: Glyph }] as variant (variant.label)}
                {@const Rendered = variant.Component}
                <span
                  class="surface-primary inline-flex items-center gap-2 rounded border border-subtle px-4 py-2"
                >
                  In a button
                  <Rendered />
                </span>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}
</Story>
