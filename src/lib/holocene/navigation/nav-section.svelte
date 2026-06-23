<script lang="ts">
  import type { NavLinkItem } from '$lib/types/global';

  import NavigationItem from './navigation-item.svelte';

  interface Props {
    navItems: NavLinkItem[];
  }

  let { navItems }: Props = $props();

  const visibleNavItems = $derived(navItems.filter((item) => !item.hidden));
</script>

{#each visibleNavItems as item (item.label)}
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
