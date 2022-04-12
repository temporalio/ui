<script lang="ts">
  import { closedBannerId, close } from '$lib/stores/banner';

  export let cluster: ClusterInformation;

  const severities = {
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  } as const;

  const isNewer = (version1: string, version2: string) => {
    if (!version1 || !version2) {
      return false;
    }

    const [major1, minor1, patch1] = version1.split('.').map(Number);
    const [major2, minor2, patch2] = version2.split('.').map(Number);

    if (major1 !== major2) {
      return major1 > major2;
    } else if (minor1 !== minor2) {
      return minor1 > minor2;
    } else {
      return patch1 > patch2;
    }
  };

  $: recommended = cluster?.versionInfo?.recommended;
  $: current = cluster?.versionInfo?.current;
  $: alert = cluster?.versionInfo?.alerts?.[0];
  $: severity = alert ? severities[alert.severity] : severities.Low;
  $: show =
    current?.version &&
    current.version != $closedBannerId &&
    isNewer(recommended?.version, current.version);

  $: message =
    severity == severities.Low
      ? `📥 v${recommended?.version} version is available`
      : `📥 ${alert?.message}`;
</script>

{#if show}
  <section class={`block leading-10 text-center ${severity}`}>
    <a
      href="https://github.com/temporalio/temporal/releases/tag/v{cluster
        ?.versionInfo?.current?.version}"
      target="_blank"
    >
      {message}
    </a>
    <button
      on:click={() => close(current.version)}
      class="absolute top-0 right-0 mr-5 text-black-600"
    >
      ✕
    </button>
  </section>
{/if}

<style lang="postcss">
  .high {
    @apply bg-red-200 text-red-900;
  }

  .medium {
    @apply bg-orange-200 text-orange-900;
  }

  .low {
    @apply bg-blue-100 text-blue-900;
  }
</style>
