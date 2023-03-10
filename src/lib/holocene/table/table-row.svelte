<script lang="ts">
  import Checkbox from '../checkbox.svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  interface $$Props extends HTMLAttributes<HTMLTableRowElement> {
    href?: string;
    selectable?: boolean;
    selected?: boolean;
    'data-testid'?: String;
  }

  export let href: string = '';
  export let selectable: boolean = false;
  export let selected: boolean = false;

  let className = '';
  export { className as class };
</script>

{#if href}
  <a class="table-row align-middle {className}" {href} {...$$restProps}>
    <td />
    {#if selectable}
      <td class:selectable on:click|stopPropagation on:keyup|stopPropagation>
        <div class="absolute">
          <Checkbox bind:checked={selected} on:change />
        </div>
      </td>
    {/if}
    <slot />
    <td />
  </a>
{:else}
  <tr on:click|stopPropagation class={className} {...$$restProps}>
    <td />
    {#if selectable}
      <td class:selectable>
        <div class="absolute">
          <Checkbox bind:checked={selected} on:change />
        </div>
      </td>
    {/if}
    <slot />
    <td />
  </tr>
{/if}
