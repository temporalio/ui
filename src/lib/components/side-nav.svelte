<script lang="ts">
  import type { Snippet } from 'svelte';

  import Navigation from '$lib/holocene/navigation/navigation-container.svelte';
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NavLinkListItem } from '$lib/types/global';

  type Props = {
    isCloud: boolean;
    linkList: NavLinkListItem[];
    environmentName?: string;
    bottomActions?: Snippet;
  };
  let {
    isCloud = false,
    linkList,
    environmentName,
    bottomActions,
  }: Props = $props();
</script>

<Navigation
  {isCloud}
  {environmentName}
  aria-label={translate('common.primary')}
>
  {#each linkList as item}
    {#if !item?.hidden}
      {#if item.divider}
        <hr class="-mx-4 my-4 border-subtle" />
      {/if}
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
  {#snippet bottom()}
    {@render bottomActions?.()}
  {/snippet}
</Navigation>
