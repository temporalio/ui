<script lang="ts">
  import type { Snippet } from 'svelte';

  import Navigation from '$lib/holocene/navigation/navigation-container.svelte';
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import {
    isNavDividerItem,
    isNavLinkItem,
  } from '$lib/holocene/navigation/navigation-utils';
  import { translate } from '$lib/i18n/translate';
  import type { NavLinkListItem } from '$lib/types/global';

  interface Props {
    isCloud?: boolean;
    linkList: NavLinkListItem[];
    bottom?: Snippet;
  }

  let { isCloud = false, linkList, bottom }: Props = $props();
</script>

<Navigation {isCloud} {bottom} aria-label={translate('common.primary')}>
  {#each linkList as item, i (i)}
    {#if isNavDividerItem(item)}
      <hr class="-mx-2 my-4 border-black/25" />
    {:else if isNavLinkItem(item) && !item.hidden}
      <NavigationItem
        link={item.href}
        label={item.label}
        icon={item.icon}
        tooltip={item?.tooltip || item.label}
        external={item?.external}
        animate={item?.animate}
        isActive={item.isActive}
      />
    {/if}
  {/each}
</Navigation>
