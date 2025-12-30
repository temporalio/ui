<script lang="ts">
  import { page } from '$app/stores';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import {
    isVersionSummaryNew,
    type RoutingConfig,
    type VersionSummary,
  } from '$lib/types/deployments';
  import {
    getBuildIdFromVersion,
    getDeploymentFromVersion,
    getDeploymentVersionFromStruct,
  } from '$lib/utilities/get-deployment-build-id';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import DeploymentStatus from './deployment-status.svelte';

  type Props = {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    columns: ConfigurableTableHeader[];
  };
  let { routingConfig, version, columns }: Props = $props();

  const currentDeploymentName = $derived(
    routingConfig.currentDeploymentVersion?.deploymentName,
  );
  const currentBuildId = $derived(
    routingConfig.currentDeploymentVersion?.buildId,
  );

  const rampingDeploymentName = $derived(
    routingConfig.rampingDeploymentVersion?.deploymentName,
  );
  const rampingBuildId = $derived(
    routingConfig.rampingDeploymentVersion?.buildId,
  );

  const versionDeploymentName = $derived(
    isVersionSummaryNew(version)
      ? version.deploymentVersion.deploymentName
      : getDeploymentFromVersion(version.version),
  );
  const versionBuildId = $derived(
    isVersionSummaryNew(version)
      ? version.deploymentVersion.buildId
      : getBuildIdFromVersion(version.version),
  );

  const isCurrent = $derived(
    versionDeploymentName === currentDeploymentName &&
      versionBuildId === currentBuildId,
  );
  const isRamping = $derived(
    versionDeploymentName === rampingDeploymentName &&
      versionBuildId === rampingBuildId,
  );
  const drainageStatus = $derived(
    isVersionSummaryNew(version) ? version.status : version.drainageStatus,
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
        ? translate('deployments.ramping-percentage', {
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
      <td class="text-left">
        {versionBuildId}
      </td>
    {:else if label === translate('deployments.status')}
      <td class="text-left">
        <div class="flex items-center gap-2">
          <DeploymentStatus {status} label={statusLabel} />
          {#if isCurrent && isVersionSummaryNew(version) && version?.currentSinceTime}
            Since <Timestamp dateTime={version.currentSinceTime} />
          {:else if isRamping && isVersionSummaryNew(version) && version?.rampingSinceTime}
            Since <Timestamp dateTime={version.rampingSinceTime} />
          {/if}
        </div>
      </td>
    {:else if label === translate('deployments.deployed')}
      <Timestamp
        as="td"
        class="whitespace-pre-line break-words text-left"
        dateTime={version?.createTime}
      />
    {:else if label === translate('deployments.actions')}
      <td class="w-24 whitespace-pre-line break-words">
        <Link
          icon="external-link"
          href={routeForWorkflowsWithQuery({
            namespace: $page.params.namespace,
            query: `TemporalWorkerDeploymentVersion="${getDeploymentVersionFromStruct(version)}"`,
          })}>{translate('deployments.go-to-workflows')}</Link
        >
      </td>
    {/if}
  {/each}
</tr>
