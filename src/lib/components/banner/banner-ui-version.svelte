<script lang="ts">
  import { isVersionNewer } from '$lib/utilities/version-check';
  import {
    BannersState,
    getLinkForUIVersion,
  } from '$lib/components/banner/banner-state';
  import Banner from './banner.svelte';

  import type { UiVersionInfo } from '$lib/types/global';

  export let shownBanner: BannersState;
  export let uiVersionInfo: UiVersionInfo;

  const severity = 'Low';
  const { current, recommended } = uiVersionInfo;
  const key = `ui-v${uiVersionInfo?.current}`;
  const message = `📥 Temporal UI v${uiVersionInfo?.recommended} is available`;
  const link = getLinkForUIVersion(uiVersionInfo);
</script>

{#if isVersionNewer(recommended, current)}
  <Banner
    {key}
    {severity}
    {message}
    {link}
    bind:shownBanner
    testId="ui-version-banner"
  />
{/if}
