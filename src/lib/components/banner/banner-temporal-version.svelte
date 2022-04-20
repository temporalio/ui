<script lang="ts">
  import { isRecommendedVersionNewer } from '$lib/utilities/version-check';
  import Banner from './banner.svelte';

  export let cluster: ClusterInformation;

  const severities = {
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  } as const;

  $: recommended = cluster?.versionInfo?.recommended;
  $: current = cluster?.versionInfo?.current;
  $: alert = cluster?.versionInfo?.alerts?.[0];
  $: severity = alert ? severities[alert.severity] : severities.Low;
  $: show = isRecommendedVersionNewer(recommended?.version, current?.version);
  $: key = `server-v${current?.version}`;
  $: link = `https://github.com/temporalio/temporal/releases/tag/v${cluster?.versionInfo?.recommended?.version}`;
  $: message =
    severity == severities.Low
      ? `📥 Temporal v${recommended?.version} is available`
      : `📥 ${alert?.message}`;
</script>

{#if show}
  <Banner {key} {severity} {message} {link} />
{/if}
