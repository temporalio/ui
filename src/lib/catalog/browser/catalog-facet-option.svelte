<script lang="ts">
  import BadgeCount from '$lib/io/badge-count/badge-count.svelte';

  import { isCatalogKind } from './catalog-kinds';
  import type { CatalogFacetOption } from './catalog-list-state';

  import CatalogKindGlyph from './catalog-kind-glyph.svelte';

  interface Props {
    option: CatalogFacetOption;
    pressed: boolean;
    variant: 'list' | 'chip';
    label?: string;
    onclick: () => void;
  }

  let {
    option,
    pressed,
    variant,
    label = option.label,
    onclick,
  }: Props = $props();

  const accessibleName = $derived(
    `${option.label}, ${option.count === 1 ? '1 example' : `${option.count} examples`}`,
  );
</script>

<button
  type="button"
  class="catalog-facet-option {variant}"
  class:text-secondary={!option.count && !pressed}
  aria-pressed={pressed}
  aria-label={accessibleName}
  {onclick}
>
  {#if isCatalogKind(option.id)}
    <CatalogKindGlyph kind={option.id} />
  {/if}
  <span class="min-w-0 flex-1 truncate">{label}</span>
  <BadgeCount
    value={option.count}
    class="text-secondary tabular-nums"
    aria-hidden="true"
  />
</button>

<style lang="postcss">
  @reference '../../../app.css';

  .catalog-facet-option {
    @apply flex items-center gap-2 text-left text-sm;

    &[aria-pressed='true'] {
      @apply border-brand bg-interactive-secondary-press font-medium;
    }
  }

  .list {
    @apply min-h-8 w-full rounded-r border-l-2 border-transparent px-2 hover:bg-interactive-secondary-hover;
  }

  .chip {
    @apply h-9 shrink-0 rounded border border-primary bg-surface-primary px-3 whitespace-nowrap;
  }
</style>
