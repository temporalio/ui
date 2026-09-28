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

  let { isCloud = false, sections, bottom }: Props = $props();
</script>

<Navigation {isCloud} {bottom} aria-label={translate('common.primary')}>
  {#each sections as section, i (i)}
    <NavSection navItems={section} />
    {#if i !== sections.length - 1}
      <hr class="my-2 border-primary group-data-[nav=closed]:hidden" />
    {/if}
  {/each}
</Navigation>
