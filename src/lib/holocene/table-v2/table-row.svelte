<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface $$Props extends HTMLAttributes<HTMLTableRowElement> {
    href?: string;
    'data-testid'?: String;
  }

  let className = '';
  export { className as class };
  export let href: string = '';
</script>

{#if href}
  <a class="row {className}" {href} {...$$restProps}>
    <slot />
  </a>
{:else}
  <tr on:click|stopPropagation class={className} {...$$restProps}>
    <slot />
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply table-row;

    :global(td) {
      @apply flex items-center;
    }
  }
</style>
