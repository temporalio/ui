<script lang="ts">
  import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  interface Props extends HTMLAttributes<HTMLTableRowElement> {
    'data-testid'?: string;
    class?: string;
    children?: Snippet;
  }

  let { class: className = '', children, onclick, ...rest }: Props = $props();

  const handleClick: MouseEventHandler<HTMLTableRowElement> = (event) => {
    event.stopPropagation();
    onclick?.(event);
  };
</script>

<tr onclick={handleClick} class={className} {...rest}>
  {@render children?.()}
</tr>
