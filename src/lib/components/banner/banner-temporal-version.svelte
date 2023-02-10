<script lang="ts">
  import { page } from '$app/stores';
  import { isVersionNewer } from '$lib/utilities/version-check';
  import type { BannersState } from '$lib/models/banner-state';
  import Banner from './banner.svelte';

  export let shownBanner: BannersState;

  const { cluster } = $page.data;

  const severities = {
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  } as const;

  const { recommended, current } = cluster?.versionInfo ?? {};
  const alert = cluster?.versionInfo?.alerts?.[0];
  const severity = alert ? severities[alert.severity] : severities.Low;
  const key = `server-v${current?.version}`;
  const link = `https://github.com/temporalio/temporal/releases/tag/v${cluster?.versionInfo?.recommended?.version}`;
  const show = isVersionNewer(recommended?.version, current?.version);
  const message =
    severity === severities.Low
      ? `📥 Temporal v${recommended?.version} is available`
      : `📥 ${alert?.message}`;
</script>

{#if show}
  <Banner
    {key}
    {severity}
    {message}
    {link}
    bind:shownBanner
    testId="temporal-version-banner"
  />
{/if}
