<script lang="ts">
  import { isVersionNewer } from '$lib/utilities/version-check';
  import type { BannersState } from '$lib/models/banner-state';
  import Banner from './banner.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { UiVersionInfo } from '$lib/types/global';

  export let shownBanner: BannersState;
  export let uiVersionInfo: UiVersionInfo;

  const severity = 'low';
  const key = `ui-v${uiVersionInfo?.current}`;
  const message = `📥 ${translate('banner-ui-version', {
    version: uiVersionInfo?.recommended,
  })}`;
  const show = isVersionNewer(
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
    testId="ui-version-banner"
  />
{/if}
