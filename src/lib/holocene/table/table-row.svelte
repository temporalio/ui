<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLTableRowElement> {
    'data-testid'?: string;
    class?: string;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    class: className = '',
    children,
    onclick = () => {},
    ...rest
  }: Props = $props();
</script>

<tr
  onclick={(e: MouseEvent) => {
    e.stopPropagation();
    onclick(e);
  }}
  class={className}
  {...rest}
>
  {@render children?.()}
</tr>
