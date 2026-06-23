<script lang="ts">
  import type { Snippet } from 'svelte';

  import NavSection from '$lib/holocene/navigation/nav-section.svelte';
  import Navigation from '$lib/holocene/navigation/navigation-container.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NavLinkItem } from '$lib/types/global';

  interface Props {
    isCloud?: boolean;
    sections: NavLinkItem[][];
    bottom?: Snippet;
  }

  let isNotLastItem = (section: NavLinkItem[], i: number): boolean => {
    return i != section.length - 1;
  };

  let { isCloud = false, sections, bottom }: Props = $props();
</script>

<Navigation {isCloud} {bottom} aria-label={translate('common.primary')}>
  {#each sections as section, i (i)}
    <NavSection navItems={section} />
    {#if isNotLastItem(section, i)}
      <hr
        class="border-black border-opacity-25 group-data-[nav=closed]:hidden"
      />
    {/if}
  {/each}
</Navigation>
