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
