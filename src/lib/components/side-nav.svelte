<script lang="ts">
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import Navigation from '$lib/holocene/navigation/navigation-container.svelte';
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NavLinkListItem } from '$lib/types/global';
  import { useDarkMode } from '$lib/utilities/dark-mode';

  export let isCloud = false;
  export let linkList: NavLinkListItem[];
</script>

<Navigation {isCloud} aria-label={translate('common.primary')}>
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
  <svelte:fragment slot="bottom">
    <NavigationButton
      onClick={() => ($useDarkMode = !$useDarkMode)}
      tooltip={$useDarkMode
        ? translate('common.night')
        : translate('common.day')}
      label={$useDarkMode ? translate('common.night') : translate('common.day')}
      icon={$useDarkMode ? 'moon' : 'sun'}
    />
    <slot name="bottom" />
  </svelte:fragment>
</Navigation>
