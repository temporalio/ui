<script lang="ts">
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import type { NavLinkListItem } from '$lib/types/global';

  export let open = false;
  export let linkList: NavLinkListItem[];
</script>

{#if open}
  <div
    class="flex h-full flex-col-reverse justify-start gap-6 overflow-auto px-4 py-8"
  >
    {#each linkList as item}
      {#if item.divider}
        <hr class="border-subtle" />
      {:else}
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
