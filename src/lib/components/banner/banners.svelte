<script lang="ts">
  import { page } from '$app/stores';
  import BannerTemporalVersion from './banner-temporal-version.svelte';
  import BannerUIVersion from './banner-ui-version.svelte';
  import {
    BannersState,
    isTemporalVersionBanner,
    isUIVersionBanner,
  } from './banner-state';
  import type { UiVersionInfo } from '$lib/types/global';

  export let uiVersionInfo: UiVersionInfo;

  let shownBanner = BannersState.TemporalVersion;
  const notifyOnNewVersion = $page.data?.settings.notifyOnNewVersion;
</script>

{#if notifyOnNewVersion}
  {#if isTemporalVersionBanner(shownBanner)}
    <BannerTemporalVersion bind:shownBanner />
  {:else if isUIVersionBanner(shownBanner)}
    <BannerUIVersion {uiVersionInfo} bind:shownBanner />
  {/if}
{/if}
