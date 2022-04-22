<script lang="ts">
  import { isRecommendedVersionNewer } from '$lib/utilities/version-check';
  import Banner from './banner.svelte';

  export let cluster: ClusterInformation;

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
  const show = isRecommendedVersionNewer(
    recommended?.version,
    current?.version,
  );
  const message =
    severity == severities.Low
      ? `📥 Temporal v${recommended?.version} is available`
      : `📥 ${alert?.message}`;
</script>

{#if show}
  <Banner {key} {severity} {message} {link} />
{/if}
