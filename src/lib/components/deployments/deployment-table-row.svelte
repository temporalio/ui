<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkerDeploymentSummary } from '$lib/types/deployments';
  import { formatDate } from '$lib/utilities/format-date';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForWorkerDeployment,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import DeploymentStatus from './deployment-status.svelte';

  export let deployment: WorkerDeploymentSummary;
  export let columns: ConfigurableTableHeader[];
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.name')}
      <td class="p-2 text-left"
        ><Link
          href={routeForWorkerDeployment({
            namespace: $page.params.namespace,
            deployment: deployment.name,
          })}>{deployment.name}</Link
        ></td
      >
    {:else if label === translate('deployments.build-id')}
      <td class="whitespace-pre-line break-words p-2 text-left">
        <div class="flex flex-col gap-1">
          {#if deployment?.rampingVersionSummary?.deploymentVersion?.buildId}
            {deployment.rampingVersionSummary.deploymentVersion.buildId}
          {/if}
          {deployment?.currentVersionSummary?.deploymentVersion?.buildId ||
            getBuildIdFromVersion(deployment.routingConfig.currentVersion)}
        </div>
      </td>
    {:else if label === translate('deployments.status')}
      <td class="whitespace-pre-line break-words p-2 text-left">
        <div class="flex flex-col gap-1">
          {#if deployment.routingConfig.rampingVersionPercentage}
            <DeploymentStatus
              status="Ramping"
              label={translate('deployments.ramping-percentage', {
                percentage: deployment.routingConfig.rampingVersionPercentage,
              })}
            />
          {/if}
          <DeploymentStatus
            status="Current"
            label={translate('deployments.current')}
          />
        </div>
      </td>
    {:else if label === translate('deployments.deployed')}
      <td class="truncate p-2 text-left">
        <div class="flex flex-col gap-1">
          {#if deployment.routingConfig.rampingVersionChangedTime}
            <p>
              {formatDate(
                deployment.routingConfig.rampingVersionChangedTime,
                $timeFormat,
                {
                  relative: $relativeTime,
                },
              )}
            </p>
          {/if}
          <p>
            {formatDate(deployment.createTime, $timeFormat, {
              relative: $relativeTime,
            })}
          </p>
        </div>
      </td>
    {:else if label === translate('deployments.workflows')}
      <td class="truncate p-2 text-center"
        ><p>
          <Link
            icon="external-link"
            href={routeForWorkflowsWithQuery({
              namespace: $page.params.namespace,
              query: `TemporalWorkerDeployment="${deployment.name}"`,
            })}
          />
        </p></td
      >
    {/if}
  {/each}
</tr>
