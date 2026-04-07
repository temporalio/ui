<script lang="ts">
  import type { NavLinkItem } from '$lib/types/global';

  import NavigationItem from './navigation-item.svelte';

  interface Props {
    navItems: NavLinkItem[];
  }

  let { navItems }: Props = $props();
</script>

{#each navItems as item (item.label)}
  <NavigationItem
    link={item.href}
    label={item.label}
    icon={item.icon}
    tooltip={item.tooltip || item.label}
    external={item.external}
    animate={item.animate}
    isActive={item.isActive}
  />
{/each}
