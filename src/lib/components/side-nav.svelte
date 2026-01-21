<script lang="ts">
  import type { Snippet } from 'svelte';

  import Navigation from '$lib/holocene/navigation/navigation-container.svelte';
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
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
  {#snippet children()}
    {#each linkList as item}
      {#if 'divider' in item && item.divider}
        <hr class="-mx-4 my-4 border-subtle" />
      {:else if 'href' in item && !item.hidden}
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
  {/snippet}
</Navigation>
