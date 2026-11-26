<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { type CatalogExecutionKind, catalogKinds } from './catalog-kinds';

  import CatalogKindGlyph from './catalog-kind-glyph.svelte';

  interface Props {
    kind: CatalogExecutionKind;
  }

  let { kind }: Props = $props();
</script>

<span
  class={merge(
    'inline-flex h-5 items-center gap-1.5 rounded px-1.5 font-medium text-primary',
    catalogKinds[kind].badgeClass,
  )}
  data-testid="catalog-kind-badge"
>
  <CatalogKindGlyph {kind} class="size-2" />
  {catalogKinds[kind].label}
</span>
