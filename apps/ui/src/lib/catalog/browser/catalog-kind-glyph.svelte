<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { type CatalogExecutionKind, catalogKinds } from './catalog-kinds';

  interface Props {
    kind: CatalogExecutionKind;
    class?: string;
  }

  let { kind, class: className = 'size-2.5' }: Props = $props();
</script>

<span
  class={merge(
    'inline-block shrink-0',
    catalogKinds[kind].glyphClass,
    className,
  )}
  aria-hidden="true"
></span>
