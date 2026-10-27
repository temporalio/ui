<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import type { IconComponent } from '$lib/io/icon';
  import * as iconModule from '$lib/io/icon';

  import DocSection from '$docs/components/doc-section.svelte';
  import FoundationPage from '$docs/components/foundation-page.svelte';
  import SelectControl from '$docs/components/select-control.svelte';

  const icons = Object.entries(iconModule)
    .filter(([name]) => name.startsWith('Icon'))
    .map(([name, component]) => ({
      name,
      label: name
        .replace(/^Icon/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .toLowerCase(),
      component: component as IconComponent,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const sizes = ['16', '24'] as const;
  let size = $state<(typeof sizes)[number]>('24');
  let query = $state('');
  let copied = $state('');
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  const normalizedQuery = $derived(
    query.trim().toLowerCase().replace(/\s+/g, ''),
  );
  const matches = $derived(
    normalizedQuery
      ? icons.filter(
          (icon) =>
            icon.name.toLowerCase().includes(normalizedQuery) ||
            icon.label.replace(/\s+/g, '').includes(normalizedQuery),
        )
      : icons,
  );

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(
        `import { ${name} } from '$lib/io/icon';`,
      );
      copied = name;
    } catch {
      copied = '';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = ''), 1500);
  }
</script>

<FoundationPage
  title="Icons"
  description="Icons from the io icon set. They inherit the current text color and default to 24 pixels. Select an icon to copy its import."
  sections={[
    { id: 'library', label: 'Library' },
    { id: 'usage', label: 'Usage' },
  ]}
>
  <DocSection id="library" title="Library" class="mt-0">
    <div class="mb-5 flex flex-wrap items-end gap-4">
      <div class="min-w-56 grow">
        <Input
          id="icon-search"
          label="Search icons"
          placeholder="arrow, workflow, check…"
          bind:value={query}
        />
      </div>
      <div class="w-32">
        <SelectControl
          id="icon-size"
          label="Size"
          options={sizes}
          bind:value={size}
        />
      </div>
    </div>
    <p role="status" aria-live="polite" class="mb-4 text-xs text-secondary">
      {#if copied}
        Copied the import for {copied}
      {:else}
        {matches.length} of {icons.length} icons
      {/if}
    </p>
    {#if matches.length}
      <ul
        class="grid list-none grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2"
      >
        {#each matches as icon (icon.name)}
          {@const Icon = icon.component}
          <li>
            <button
              type="button"
              class="flex h-28 w-full flex-col items-center justify-center gap-3 rounded-lg border border-primary p-2 text-primary hover:bg-interactive-tertiary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
              aria-label="Copy import for {icon.name}"
              onclick={() => copy(icon.name)}
            >
              <Icon width={Number(size)} height={Number(size)} />
              <span
                class="w-full truncate text-center font-mono text-[11px] text-secondary"
                >{copied === icon.name ? 'Copied' : icon.name}</span
              >
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p
        class="rounded-lg border border-dashed border-primary p-8 text-center text-sm text-secondary"
      >
        No icons match “{query}”.
      </p>
    {/if}
  </DocSection>
  <DocSection id="usage" title="Usage">
    <div
      class="space-y-3 text-sm leading-relaxed text-secondary [&_code]:rounded [&_code]:bg-surface-secondary [&_code]:px-1 [&_code]:text-xs"
    >
      <p>
        Import icons by name from <code>$lib/io/icon</code>. They render as
        inline SVG and use <code>currentColor</code>, so set the color with a
        text class on the icon or its parent.
      </p>
      <p>
        Icons are decorative by default. When an icon is the only content of a
        button or link, give that control an accessible name with
        <code>aria-label</code>.
      </p>
      <p>
        Components that accept icons, such as Button, take the component itself: <code
          >LeadingIcon=&#123;IconAdd&#125;</code
        >.
      </p>
    </div>
  </DocSection>
</FoundationPage>
