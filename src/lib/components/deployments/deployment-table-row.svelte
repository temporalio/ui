<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { WorkerDeploymentSummary } from '$lib/types/deployments';
  import { parseVersionStatus } from '$lib/utilities/deployments';
  import {
    routeForWorkerDeployment,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import ComputeBadge from './compute-badge.svelte';
  import DeploymentStatus from './deployment-status.svelte';

  type Props = {
    deployment: WorkerDeploymentSummary;
    columns: ConfigurableTableHeader[];
  };
  let { deployment, columns }: Props = $props();

  const latestBuildId = $derived(
    deployment?.latestVersionSummary?.deploymentVersion?.buildId,
  );

  const latestVersionStatus = $derived(
    deployment?.latestVersionSummary?.status
      ? parseVersionStatus(
          deployment.latestVersionSummary.status,
          deployment?.routingConfig?.rampingVersionPercentage,
        )
      : null,
  );
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.deployment')}
      <td class="py-1 text-left">
        <Copyable
          content={deployment.name}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        >
          <Link
            href={routeForWorkerDeployment({
              namespace: page.params.namespace,
              deployment: deployment.name,
            })}>{deployment.name}</Link
          >
        </Copyable>
      </td>
    {:else if label === translate('deployments.latest-version')}
      <td class="py-1 text-left">
        {#if latestBuildId}
          <div class="flex items-center gap-2">
            <Copyable
              content={latestBuildId}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            >
              <Link
                href={routeForWorkflowsWithQuery({
                  namespace: page.params.namespace,
                  query: `TemporalWorkerDeploymentVersion="${deployment.name}:${latestBuildId}"`,
                })}
              >
                {latestBuildId}
              </Link>
            </Copyable>
            {#if latestVersionStatus}
              <DeploymentStatus
                status={latestVersionStatus.status}
                label={latestVersionStatus.label}
              />
            {/if}
            <ComputeBadge
              type={Object.values(
                deployment.latestVersionSummary?.computeConfig?.scalingGroups ??
                  {},
              )[0]?.provider?.type}
            />
          </div>
        {:else}
          <span class="text-secondary">—</span>
        {/if}
      </td>
    {:else if label === translate('deployments.created')}
      <td class="truncate py-1 text-left">
        <Timestamp as="p" dateTime={deployment.createTime} />
      </td>
    {/if}
  {/each}
</tr>
