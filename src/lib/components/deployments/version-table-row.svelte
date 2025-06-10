<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import {
    isVersionSummaryNew,
    type RoutingConfig,
    type VersionSummary,
  } from '$lib/types/deployments';
  import { formatDate } from '$lib/utilities/format-date';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import DeploymentStatus from './deployment-status.svelte';

  type Props = {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    columns: ConfigurableTableHeader[];
  };
  let { routingConfig, version, columns }: Props = $props();

  const isCurrent = $derived(version.version === routingConfig.currentVersion);
  const isRamping = version.version === routingConfig.rampingVersion;
  const drainageStatus = $derived(
    isVersionSummaryNew(version) ? version.status : version.drainageStatus,
  );
  const buildId = $derived(
    isVersionSummaryNew(version)
      ? version.deploymentVersion.buildId
      : getBuildIdFromVersion(version.version),
  );
  const statusEnum = $derived(
    isVersionSummaryNew(version)
      ? 'WorkerDeploymentVersionStatus'
      : 'VersionDrainageStatus',
  );

  const status = $derived(
    isCurrent
      ? translate('deployments.current')
      : isRamping
        ? translate('deployments.ramping')
        : drainageStatus
          ? fromScreamingEnum(drainageStatus, statusEnum)
          : translate('common.inactive'),
  ) as Status;

  const statusLabel = $derived(
    isCurrent
      ? translate('deployments.current')
      : isRamping
        ? translate('deployments.ramping', {
            percentage: routingConfig.rampingVersionPercentage,
          })
        : drainageStatus
          ? fromScreamingEnum(drainageStatus, statusEnum)
          : translate('common.inactive'),
  );
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.build-id')}
      <td class="w-full text-left">
        <div class="flex items-center gap-2">
          {buildId}
          <DeploymentStatus {status} label={statusLabel} />
        </div>
      </td>
    {:else if label === translate('deployments.deployed')}
      <td class="whitespace-pre-line break-words text-left"
        >{formatDate(version?.createTime, $timeFormat, {
          relative: $relativeTime,
        })}</td
      >
    {:else if label === translate('deployments.workflows')}
      <td class="whitespace-pre-line break-words text-center"
        ><p>
          <Link
            icon="external-link"
            href={routeForWorkflowsWithQuery({
              namespace: $page.params.namespace,
              query: `TemporalWorkerDeploymentVersion="${version.version}"`,
            })}
          />
        </p></td
      >
    {/if}
  {/each}
</tr>
