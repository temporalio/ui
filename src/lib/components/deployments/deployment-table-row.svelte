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

  type Props = {
    deployment: WorkerDeploymentSummary;
    columns: ConfigurableTableHeader[];
  };
  let { deployment, columns }: Props = $props();

  const rampingBuildID = $derived(
    deployment?.rampingVersionSummary?.deploymentVersion?.buildId ||
      getBuildIdFromVersion(deployment?.routingConfig?.rampingVersion),
  );
  const currentBuildId = $derived(
    deployment?.currentVersionSummary?.deploymentVersion?.buildId ||
      getBuildIdFromVersion(deployment?.routingConfig?.currentVersion),
  );
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.name')}
      <td class="text-left"
        ><Link
          href={routeForWorkerDeployment({
            namespace: $page.params.namespace,
            deployment: deployment.name,
          })}>{deployment.name}</Link
        ></td
      >
    {:else if label === translate('deployments.build-id')}
      <td class="whitespace-pre-line break-words text-left">
        <div class="flex flex-col gap-1">
          {#if rampingBuildID}
            <div class="flex items-center gap-2">
              {rampingBuildID}
              {#if deployment?.routingConfig?.rampingVersionPercentage}
                <DeploymentStatus
                  status="Ramping"
                  label={translate('deployments.ramping-percentage', {
                    percentage:
                      deployment.routingConfig.rampingVersionPercentage,
                  })}
                />
              {/if}
            </div>
          {/if}
          <div class="flex items-center gap-2">
            {currentBuildId}
            <DeploymentStatus
              status="Current"
              label={translate('deployments.current')}
            />
          </div>
        </div>
      </td>
    {:else if label === translate('deployments.deployed')}
      <td class="truncate py-2 text-left">
        <div class="flex flex-col gap-1">
          {#if rampingBuildID && deployment.routingConfig.rampingVersionChangedTime}
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
      <td class="truncate text-center"
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
