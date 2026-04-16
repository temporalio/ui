<script lang="ts">
  import { invalidate } from '$app/navigation';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeploymentVersion,
    fetchDeploymentVersion,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import {
    isVersionSummaryNew,
    type RoutingConfig,
    type VersionSummary,
  } from '$lib/types/deployments';
  import { parseVersionStatus } from '$lib/utilities/deployments';
  import {
    getBuildIdFromVersion,
    getDeploymentFromVersion,
    getDeploymentVersionFromStruct,
  } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForWorkerDeploymentVersionEdit,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import ComputeBadge from './compute-badge.svelte';
  import DeleteVersionModal from './delete-version-modal.svelte';
  import DeploymentStatus from './deployment-status.svelte';
  import ValidateConnectionModal from './validate-connection-modal.svelte';
  import VersionActionsMenu from './version-actions-menu.svelte';
  import VersionRowDetails from './version-row-details.svelte';

  interface Props {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    namespace: string;
    deploymentName: string;
    conflictToken?: string;
  }
  let {
    routingConfig,
    version,
    namespace,
    deploymentName,
    conflictToken,
  }: Props = $props();

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

  function resolveVersionStatus(): Status {
    if (isCurrent) return translate('deployments.current') as Status;
    if (isRamping) return translate('deployments.ramping') as Status;
    if (isVersionSummaryNew(version))
      return parseVersionStatus(drainageStatus).status;
    if (drainageStatus)
      return fromScreamingEnum(drainageStatus, statusEnum) as Status;
    return translate('common.inactive') as Status;
  }
  const status = $derived(resolveVersionStatus());

  function resolveVersionStatusLabel(): string {
    if (isCurrent) return translate('deployments.current');
    if (isRamping)
      return translate('deployments.ramping-percentage', {
        percentage: routingConfig.rampingVersionPercentage ?? 0,
      });
    if (isVersionSummaryNew(version))
      return parseVersionStatus(drainageStatus).label;
    if (drainageStatus) return fromScreamingEnum(drainageStatus, statusEnum);
    return translate('common.inactive');
  }
  const statusLabel = $derived(resolveVersionStatusLabel());

  const computeScalingGroup = $derived(
    isVersionSummaryNew(version) && version.computeConfig
      ? Object.values(version.computeConfig.scalingGroups ?? {})[0]
      : undefined,
  );
  const computeProviderType = $derived(
    computeScalingGroup?.providerType ?? computeScalingGroup?.provider?.type,
  );

  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeploymentVersion="${getDeploymentVersionFromStruct(version)}"`,
    }) ?? '',
  );

  const editHref = $derived(
    routeForWorkerDeploymentVersionEdit({
      namespace,
      deployment: versionDeploymentName,
      buildId: versionBuildId,
    }),
  );

  let expanded = $state(false);
  let showDeleteVersionModal = $state(false);
  let deleteVersionError = $state('');
  let showValidateModal = $state(false);
  let validateLoading = $state(false);
  let validateResult = $state<{ valid: boolean; message?: string } | null>(
    null,
  );

  async function handleValidateConnection() {
    validateResult = null;
    validateLoading = true;
    showValidateModal = true;
    const versionDetails = await fetchDeploymentVersion({
      namespace,
      deploymentName,
      buildId: versionBuildId,
    });
    const computeConfig =
      versionDetails.workerDeploymentVersionInfo.computeConfig;
    if (!computeConfig) {
      validateLoading = false;
      return;
    }
    validateResult = await validateWorkerDeploymentVersionComputeConfig(
      { namespace, deploymentName, buildId: versionBuildId, computeConfig },
      () => {
        validateLoading = false;
        validateResult = {
          valid: false,
          message: translate('deployments.validate-connection-error'),
        };
      },
    );
    validateLoading = false;
  }

  async function handleDeleteVersion() {
    deleteVersionError = '';
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName, buildId: versionBuildId, conflictToken },
      (err) => {
        deleteVersionError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.delete-version-error');
      },
    );
    if (deleteVersionError) return;
    showDeleteVersionModal = false;
    await invalidate('data:deployment');
  }
</script>

<tr>
  <td class="text-left">
    <div class="flex items-center gap-1">
      <CapabilityGuard capability="serverScaledDeployments">
        {#if computeProviderType}
          <button
            type="button"
            aria-label={expanded
              ? translate('common.collapse')
              : translate('common.expand')}
            onclick={() => (expanded = !expanded)}
            class="shrink-0"
          >
            <Icon
              name="chevron-right"
              class="h-4 w-4 transition-transform {expanded ? 'rotate-90' : ''}"
            />
          </button>
        {/if}
      </CapabilityGuard>
      <Copyable
        content={versionBuildId}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      >
        <Link href={workflowHref}>
          {versionBuildId}
        </Link>
      </Copyable>
    </div>
  </td>
  <td class="text-left">
    <DeploymentStatus {status} label={statusLabel} />
  </td>
  <CapabilityGuard capability="serverScaledDeployments">
    <td class="text-left">
      <ComputeBadge type={computeProviderType} />
    </td>
  </CapabilityGuard>
  <Timestamp
    as="td"
    class="whitespace-pre-line break-words text-left"
    dateTime={version?.createTime}
  />
  <VersionActionsMenu
    buildId={versionBuildId}
    {editHref}
    {workflowHref}
    onValidate={handleValidateConnection}
    onDelete={() => (showDeleteVersionModal = true)}
  />
</tr>

{#if expanded}
  <tr class="surface-primary border-y border-subtle">
    <td colspan={5} class="!p-1">
      <VersionRowDetails
        {namespace}
        {deploymentName}
        buildId={versionBuildId}
      />
    </td>
  </tr>
{/if}

<ValidateConnectionModal
  buildId={versionBuildId}
  open={showValidateModal}
  loading={validateLoading}
  result={validateResult}
  onClose={() => (showValidateModal = false)}
/>

<DeleteVersionModal
  buildId={versionBuildId}
  open={showDeleteVersionModal}
  error={deleteVersionError}
  onConfirm={handleDeleteVersion}
  onCancel={() => {
    showDeleteVersionModal = false;
    deleteVersionError = '';
  }}
/>
