<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface $$Props extends HTMLAttributes<HTMLTableRowElement> {
    href?: string;
    'data-testid'?: String;
  }

  export let href: string = '';

  let className = '';
  export { className as class };
</script>

{#if href}
  <a class="table-row align-middle {className}" {href} {...$$restProps}>
    <td />
    <slot />
    <td />
  </a>
{:else}
  <tr on:click|stopPropagation class={className} {...$$restProps}>
    <td />
    <slot />
    <td />
  </tr>
{/if}
