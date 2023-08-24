<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface $$Props extends HTMLAttributes<HTMLTableRowElement> {
    'data-testid'?: String;
  }

  let className = '';
  export { className as class };
</script>

<tr on:click|stopPropagation class={className} {...$$restProps}>
  <td />
  <slot />
  <td />
</tr>
