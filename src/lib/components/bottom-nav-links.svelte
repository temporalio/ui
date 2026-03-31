<script lang="ts">
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import {
    isNavDividerItem,
    isNavLinkItem,
  } from '$lib/holocene/navigation/navigation-utils';
  import type { NavLinkListItem } from '$lib/types/global';

  export let open = false;
  export let linkList: NavLinkListItem[];
</script>

{#if open}
  <div
    class="flex h-full flex-col-reverse justify-start gap-6 overflow-auto px-4 py-8"
  >
    {#each linkList as item, i (i)}
      {#if isNavDividerItem(item)}
        <hr class="border-subtle" />
      {:else if isNavLinkItem(item)}
        <NavigationItem
          link={item.href}
          label={item.label}
          icon={item.icon}
          tooltip={item.tooltip || item.label}
          external={item?.external}
          animate={item?.animate}
        />
      {/if}
    {/each}
  </div>
{/if}
