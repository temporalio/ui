<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkerDeploymentSummary } from '$lib/types/deployments';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    routeForWorkerDeployment,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  export let deployment: WorkerDeploymentSummary;
  export let columns: ConfigurableTableHeader[];
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.name')}
      <td class="cell"
        ><Link
          href={routeForWorkerDeployment({
            namespace: $page.params.namespace,
            deployment: deployment.name,
          })}>{deployment.name}</Link
        ></td
      >
    {:else if label === translate('deployments.current-version')}
      <td class="cell whitespace-pre-line break-words"
        >{deployment.routingConfig.currentVersion}</td
      >
    {:else if label === translate('deployments.created')}
      <td class="cell truncate"
        >{formatDate(deployment.createTime, $timeFormat, {
          relative: $relativeTime,
        })}</td
      >
    {:else if label === translate('deployments.ramping')}
      <td class="cell whitespace-pre-line break-words"
        >{deployment.routingConfig.rampingVersion} 📈 Ramping {deployment
          .routingConfig.rampingVersionPercentage}%</td
      >
    {:else if label === translate('deployments.workflows')}
      <td class="cell truncate"
        ><Link
          href={routeForWorkflowsWithQuery({
            namespace: $page.params.namespace,
            query: `TemporalWorkerDeployment="${deployment.name}"`,
          })}><Icon name="external-link" /></Link
        ></td
      >
    {/if}
  {/each}
</tr>

<style lang="postcss">
  .cell {
    @apply p-2 text-left;
  }
</style>
