<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { BannersState } from '$lib/models/banner-state';
  import type { UiVersionInfo } from '$lib/types/global';
  import { isVersionNewer } from '$lib/utilities/version-check';
  
  import Banner from './banner.svelte';
  

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
    data-testid="ui-version-banner"
    role="alertdialog"
  />
{/if}
