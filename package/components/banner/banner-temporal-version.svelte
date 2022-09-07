<script>var _a, _b, _c, _d, _e;
import { page } from '$app/stores';
import { isVersionNewer } from '../../utilities/version-check';
import Banner from './banner.svelte';
export let shownBanner;
const { cluster } = $page.stuff;
const severities = {
    High: 'high',
    Medium: 'medium',
    Low: 'low',
};
const { recommended, current } = (_a = cluster === null || cluster === void 0 ? void 0 : cluster.versionInfo) !== null && _a !== void 0 ? _a : {};
const alert = (_c = (_b = cluster === null || cluster === void 0 ? void 0 : cluster.versionInfo) === null || _b === void 0 ? void 0 : _b.alerts) === null || _c === void 0 ? void 0 : _c[0];
const severity = alert ? severities[alert.severity] : severities.Low;
const key = `server-v${current === null || current === void 0 ? void 0 : current.version}`;
const link = `https://github.com/temporalio/temporal/releases/tag/v${(_e = (_d = cluster === null || cluster === void 0 ? void 0 : cluster.versionInfo) === null || _d === void 0 ? void 0 : _d.recommended) === null || _e === void 0 ? void 0 : _e.version}`;
const show = isVersionNewer(recommended === null || recommended === void 0 ? void 0 : recommended.version, current === null || current === void 0 ? void 0 : current.version);
const message = severity === severities.Low
    ? `📥 Temporal v${recommended === null || recommended === void 0 ? void 0 : recommended.version} is available`
    : `📥 ${alert === null || alert === void 0 ? void 0 : alert.message}`;
</script>

{#if show}
  <Banner
    {key}
    {severity}
    {message}
    {link}
    bind:shownBanner
    dataCy="temporal-version-banner"
  />
{/if}
