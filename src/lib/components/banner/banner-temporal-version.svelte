<script lang="ts">
  import { page } from '$app/stores';
  import { isVersionNewer } from '$lib/utilities/version-check';
  import {
    BannersState,
    getLinkForTemporalVersion,
  } from '$lib/components/banner/banner-state';
  import type { ClusterInformation } from '$lib/types/global';

  import Banner from './banner.svelte';

  export let shownBanner: BannersState;

  const cluster: ClusterInformation = $page.data.cluster;

  const { recommended, current } = cluster.versionInfo;
  const [alert] = cluster?.versionInfo?.alerts;
  const severity = alert.severity;
  const key = `server-v${current.version}`;
  const link = getLinkForTemporalVersion(cluster);
  const message =
    alert.severity === 'Low'
      ? `📥 Temporal v${recommended?.version} is available`
      : `📥 ${alert?.message}`;
</script>

{#if isVersionNewer(recommended?.version, current?.version)}
  <Banner
    {key}
    {severity}
    {message}
    {link}
    bind:shownBanner
    testId="temporal-version-banner"
  />
{/if}
