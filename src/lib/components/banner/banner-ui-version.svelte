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
  const message = uiVersionInfo?.recommended.then((version) => {
    return `📥 ${translate('banner-ui-version', {
      version,
    })}`;
  });
  const show = isVersionNewer(
    uiVersionInfo?.recommended,
    uiVersionInfo?.current,
  );
  const link = `https://github.com/temporalio/ui-server/releases/tag/v${uiVersionInfo?.recommended}`;
</script>

{#await message then m}
  {#if show}
    <Banner
      {key}
      {severity}
      message={m}
      {link}
      bind:shownBanner
      data-testid="ui-version-banner"
      role="alertdialog"
    />
  {/if}
{/await}
