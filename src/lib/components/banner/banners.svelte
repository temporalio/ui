<script lang="ts">
  import { page } from '$app/stores';
  import { BannersState } from '$lib/models/banner-state';
  import BannerTemporalVersion from './banner-temporal-version.svelte';
  import BannerUIVersion from './banner-ui-version.svelte';

  export let uiVersionInfo: UiVersionInfo;

  let shownBanner = BannersState.TemporalVersion;
  const notifyOnNewVersion = $page.stuff.settings.notifyOnNewVersion;
</script>

{#if notifyOnNewVersion}
  {#if shownBanner === BannersState.TemporalVersion}
    <BannerTemporalVersion bind:shownBanner />
  {:else if shownBanner === BannersState.UIVersion}
    <BannerUIVersion {uiVersionInfo} bind:shownBanner />
  {/if}
{/if}
