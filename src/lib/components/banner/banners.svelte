<script lang="ts">
  import { BannersState } from '$lib/models/banner-state';
  import BannerTemporalVersion from './banner-temporal-version.svelte';
  import BannerUIVersion from './banner-ui-version.svelte';

  export let uiVersionInfo: UiVersionInfo;

  let shownBanner = BannersState.TemporalVersion;
</script>

{#if shownBanner === BannersState.TemporalVersion}
  <BannerTemporalVersion bind:shownBanner />
{:else if shownBanner === BannersState.UIVersion}
  <BannerUIVersion {uiVersionInfo} bind:shownBanner />
{/if}
