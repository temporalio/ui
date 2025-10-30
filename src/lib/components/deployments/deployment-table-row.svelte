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

  const latestBuildId = $derived(
    deployment?.latestVersionSummary?.deploymentVersion?.buildId,
  );
  const rampingBuildId = $derived(
    deployment?.rampingVersionSummary?.deploymentVersion?.buildId ||
      getBuildIdFromVersion(deployment?.routingConfig?.rampingVersion),
  );
  const rampingVersionDeployedTimestamp = $derived(
    deployment?.rampingVersionSummary?.createTime ||
      deployment?.routingConfig?.rampingVersionChangedTime,
  );
  const currentBuildId = $derived(
    deployment?.currentVersionSummary?.deploymentVersion?.buildId ||
      getBuildIdFromVersion(deployment?.routingConfig?.currentVersion),
  );
  const latestNotDuplicate = $derived(
    latestBuildId !== rampingBuildId && latestBuildId !== currentBuildId,
  );
  const versionedCurrent = $derived(currentBuildId !== '__unversioned__');
  const currentLabel = $derived(
    versionedCurrent ? currentBuildId : translate('deployments.unversioned'),
  );
  const latestDeploymentTimestamp = $derived(
    latestBuildId &&
      latestBuildId === currentBuildId &&
      deployment.latestVersionSummary?.createTime
      ? deployment.latestVersionSummary.createTime
      : deployment.createTime,
  );
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.name')}
      <td class="py-1 text-left"
        ><Link
          href={routeForWorkerDeployment({
            namespace: $page.params.namespace,
            deployment: deployment.name,
          })}>{deployment.name}</Link
        ></td
      >
    {:else if label === translate('deployments.build-id')}
      <td class="whitespace-pre-line break-words py-1 text-left">
        <div class="flex flex-col gap-1">
          {#if latestBuildId && latestNotDuplicate}
            <div class="flex items-center gap-2">
              {latestBuildId}
              <DeploymentStatus
                status="Latest"
                label={translate('deployments.latest')}
              />
            </div>
          {/if}
          {#if rampingBuildId}
            <div class="flex items-center gap-2">
              {rampingBuildId}
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
            {currentLabel}
            {#if versionedCurrent}
              <DeploymentStatus
                status="Current"
                label={translate('deployments.current')}
              />
            {/if}
          </div>
        </div>
      </td>
    {:else if label === translate('deployments.deployed')}
      <td class="truncate py-1 text-left">
        <div class="flex flex-col gap-1">
          {#if latestBuildId && latestNotDuplicate && deployment.latestVersionSummary?.createTime}
            <p>
              {formatDate(
                deployment.latestVersionSummary.createTime,
                $timeFormat,
                {
                  relative: $relativeTime,
                },
              )}
            </p>
          {/if}
          {#if rampingBuildId && rampingVersionDeployedTimestamp}
            <p>
              {formatDate(rampingVersionDeployedTimestamp, $timeFormat, {
                relative: $relativeTime,
              })}
            </p>
          {/if}
          <p>
            {#if versionedCurrent}
              {formatDate(latestDeploymentTimestamp, $timeFormat, {
                relative: $relativeTime,
              })}
            {:else}
              -
            {/if}
          </p>
        </div>
      </td>
    {:else if label === translate('deployments.actions')}
      <td class="w-24 truncate py-1">
        <Link
          icon="external-link"
          href={routeForWorkflowsWithQuery({
            namespace: $page.params.namespace,
            query: `TemporalWorkerDeployment="${deployment.name}"`,
          })}>{translate('deployments.go-to-workflows')}</Link
        >
      </td>
    {/if}
  {/each}
</tr>
