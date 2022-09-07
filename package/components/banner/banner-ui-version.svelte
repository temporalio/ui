<script>import { isVersionNewer } from '../../utilities/version-check';
import Banner from './banner.svelte';
export let shownBanner;
export let uiVersionInfo;
const severity = 'low';
const key = `ui-v${uiVersionInfo === null || uiVersionInfo === void 0 ? void 0 : uiVersionInfo.current}`;
const message = `📥 Temporal UI v${uiVersionInfo === null || uiVersionInfo === void 0 ? void 0 : uiVersionInfo.recommended} is available`;
const show = isVersionNewer(uiVersionInfo === null || uiVersionInfo === void 0 ? void 0 : uiVersionInfo.recommended, uiVersionInfo === null || uiVersionInfo === void 0 ? void 0 : uiVersionInfo.current);
const link = `https://github.com/temporalio/ui-server/releases/tag/v${uiVersionInfo === null || uiVersionInfo === void 0 ? void 0 : uiVersionInfo.recommended}`;
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
