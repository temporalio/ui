<script>import { page } from '$app/stores';
import { BannersState } from '../../models/banner-state';
import BannerTemporalVersion from './banner-temporal-version.svelte';
import BannerUIVersion from './banner-ui-version.svelte';
export let uiVersionInfo;
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
