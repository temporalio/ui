<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeploymentVersion } from '$lib/services/deployments-service';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type {
    VersionSummary,
    WorkerDeploymentVersionInfo,
  } from '$lib/types/deployments';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForWorkerDeploymentVersion } from '$lib/utilities/route-for';

  export let version: VersionSummary;
  export let columns: ConfigurableTableHeader[];

  let versionInfo: WorkerDeploymentVersionInfo | undefined = undefined;

  onMount(async () => {
    try {
      const versionInfoResponse = await fetchDeploymentVersion({
        namespace: $page.params.namespace,
        version: version.version,
      });

      versionInfo = versionInfoResponse.workerDeploymentVersionInfo;
    } catch (e) {
      console.error('Error fetching version info:', e);
    }
  });
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.version')}
      <td class="cell"
        ><Link
          href={routeForWorkerDeploymentVersion({
            namespace: $page.params.namespace,
            deployment: $page.params.deployment,
            version: version.version,
          })}>{version.version}</Link
        ></td
      >
    {:else if label === translate('deployments.status')}
      <td class="cell truncate"
        >{version.drainageStatus} {versionInfo?.rampPercentage}</td
      >
    {:else if label === translate('deployments.task-queue-name')}
      <td class="cell truncate">{versionInfo?.taskQueueInfos[0]?.name}</td>
    {:else if label === translate('deployments.rollout-started')}
      <td class="cell whitespace-pre-line break-words"
        >{formatDate(versionInfo?.rampingSinceTime, $timeFormat, {
          relative: $relativeTime,
        })}</td
      >
    {:else if label === translate('deployments.rollout-completed')}
      <td class="cell whitespace-pre-line break-words"
        >{formatDate(versionInfo?.currentSinceTime, $timeFormat, {
          relative: $relativeTime,
        })}</td
      >
    {:else if label === translate('deployments.rollout-url')}
      <td class="cell whitespace-pre-line break-words"
        ><Icon name="external-link" /></td
      >
    {/if}
  {/each}
</tr>

<style lang="postcss">
  .cell {
    @apply p-2 text-left;
  }
</style>
