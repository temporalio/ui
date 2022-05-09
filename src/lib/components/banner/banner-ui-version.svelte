<script lang="ts">
  import { isRecommendedVersionNewer } from '$lib/utilities/version-check';
  import type { BannersState } from '$lib/models/banner-state';
  import Banner from './banner.svelte';

  export let shownBanner: BannersState;
  export let uiVersionInfo: UiVersionInfo;

  const severity = 'low';
  const key = `ui-v${uiVersionInfo?.current}`;
  const message = `📥 Temporal UI v${uiVersionInfo?.recommended} is available`;
  const show = isRecommendedVersionNewer(
    uiVersionInfo?.recommended,
    uiVersionInfo?.current,
  );
  const link = `https://github.com/temporalio/ui-server/releases/tag/v${uiVersionInfo?.recommended}`;
</script>

{#if show}
  <Banner
    {key}
    {severity}
    {message}
    {link}
    bind:shownBanner
    dataCy="ui-version-banner"
  />
{/if}
