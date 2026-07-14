<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeploymentVersion,
    fetchDeploymentVersion,
    removeRampingDeploymentVersion,
    setCurrentDeploymentVersion,
    setRampingDeploymentVersion,
    unsetCurrentDeploymentVersion,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import { toaster } from '$lib/stores/toaster';
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
  import ConnectionBadge from './connection-badge.svelte';
  import DeleteVersionModal from './delete-version-modal.svelte';
  import DeploymentStatus from './deployment-status.svelte';
  import SetCurrentVersionModal from './set-current-version-modal.svelte';
  import SetRampingVersionModal from './set-ramping-version-modal.svelte';
  import ValidateConnectionModal from './validate-connection-modal.svelte';
  import VersionActionsMenu from './version-actions-menu.svelte';
  import VersionRowDetails from './version-row-details.svelte';

  interface Props {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    namespace: string;
    deploymentName: string;
    conflictToken?: string;
    onChange?: () => void;
  }
  let {
    routingConfig,
    version,
    namespace,
    deploymentName,
    conflictToken,
    onChange,
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

  const connectionVisible = $derived(
    isCurrent ||
      isRamping ||
      parseVersionStatus(drainageStatus).status === 'Draining',
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

  const canRampToVersion = $derived(
    parseVersionStatus(drainageStatus).status !== 'Created',
  );
  const otherVersionRamping = $derived(
    rampingBuildId && !isRamping
      ? `${rampingDeploymentName}.${rampingBuildId}`
      : undefined,
  );

  let expanded = $state(false);
  let showSetCurrentModal = $state(false);
  let setCurrentError = $state('');
  let showUnsetCurrentModal = $state(false);
  let unsetCurrentError = $state('');
  let showDeleteVersionModal = $state(false);
  let deleteVersionError = $state('');
  let showValidateModal = $state(false);
  let validateLoading = $state(false);
  let validateResult = $state<{ message?: string } | null>(null);
  let showSetRampingModal = $state(false);
  let setRampingError = $state('');
  let setRampingLoading = $state(false);
  let rampingPercentage = $state(0);

  const newVersionGracePeriodMs = 2 * 60 * 1000;

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
      validateResult = {
        message: translate('deployments.validate-connection-no-config'),
      };
      validateLoading = false;
      return;
    }
    const taskQueueInfos =
      versionDetails.workerDeploymentVersionInfo.taskQueueInfos;
    if (!taskQueueInfos?.length) {
      const createTime = versionDetails.workerDeploymentVersionInfo.createTime;
      const isNewlyCreated =
        Date.now() - new Date(String(createTime)).getTime() <
        newVersionGracePeriodMs;
      validateResult = {
        message: translate(
          isNewlyCreated
            ? 'deployments.validate-connection-no-task-queue-pending'
            : 'deployments.validate-connection-no-task-queue',
        ),
      };
      validateLoading = false;
      return;
    }
    let errorMessage: string | undefined;
    await validateWorkerDeploymentVersionComputeConfig(
      { namespace, deploymentName, buildId: versionBuildId, computeConfig },
      (error) => {
        errorMessage =
          (error.body as { message?: string })?.message ??
          translate('deployments.validate-connection-error');
      },
    );
    validateResult = { message: errorMessage };
    validateLoading = false;
  }

  async function handleSetCurrentVersion() {
    setCurrentError = '';
    await setCurrentDeploymentVersion(
      { namespace, deploymentName, buildId: versionBuildId },
      (err) => {
        setCurrentError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.set-as-current-error');
      },
    );
    if (setCurrentError) return;
    showSetCurrentModal = false;
    toaster.push({
      variant: 'primary',
      message: translate('deployments.set-current-version-success', {
        buildId: versionBuildId,
      }),
    });
    onChange?.();
  }

  async function handleUnsetCurrentVersion() {
    unsetCurrentError = '';
    await unsetCurrentDeploymentVersion(
      { namespace, deploymentName, conflictToken },
      (err) => {
        unsetCurrentError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.unset-current-error');
      },
    );
    if (unsetCurrentError) return;
    showUnsetCurrentModal = false;
    onChange?.();
  }

  function openSetRamping() {
    rampingPercentage = isRamping
      ? (routingConfig.rampingVersionPercentage ?? 0)
      : 0;
    setRampingError = '';
    showSetRampingModal = true;
  }

  async function handleSetRamping() {
    setRampingError = '';
    setRampingLoading = true;
    try {
      await setRampingDeploymentVersion(
        {
          namespace,
          deploymentName,
          buildId: versionBuildId,
          rampingVersionPercentage: rampingPercentage,
          conflictToken,
        },
        (err) => {
          setRampingError =
            (err as { body?: { message?: string } })?.body?.message ??
            translate('deployments.set-ramping-error');
        },
      );
    } finally {
      setRampingLoading = false;
    }
    if (setRampingError) return;
    showSetRampingModal = false;
    toaster.push({
      variant: 'primary',
      message: translate('deployments.set-ramping-success', {
        buildId: versionBuildId,
        percentage: rampingPercentage,
      }),
    });
    onChange?.();
  }

  async function handleRemoveRamping() {
    setRampingError = '';
    setRampingLoading = true;
    try {
      await removeRampingDeploymentVersion(
        { namespace, deploymentName, conflictToken },
        (err) => {
          setRampingError =
            (err as { body?: { message?: string } })?.body?.message ??
            translate('deployments.remove-ramping-error');
        },
      );
    } finally {
      setRampingLoading = false;
    }
    if (setRampingError) return;
    showSetRampingModal = false;
    toaster.push({
      variant: 'primary',
      message: translate('deployments.remove-ramping-success', {
        buildId: versionBuildId,
      }),
    });
    onChange?.();
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
    onChange?.();
  }
</script>

<tr>
  <td class="text-left">
    <div class="flex items-center gap-1">
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
  <td class="text-left">
    <ComputeBadge type={computeProviderType} />
  </td>
  <td class="text-left">
    {#if connectionVisible && isVersionSummaryNew(version) && computeProviderType}
      <ConnectionBadge computeStatus={version.computeStatus} />
    {:else}
      <span class="text-secondary">—</span>
    {/if}
  </td>
  <Timestamp
    as="td"
    class="whitespace-pre-line break-words text-left"
    dateTime={version?.createTime}
  />
  <VersionActionsMenu
    buildId={versionBuildId}
    {editHref}
    {workflowHref}
    {isCurrent}
    hasComputeConfig={isVersionSummaryNew(version)
      ? !!version.computeConfig
      : true}
    {isRamping}
    onSetCurrent={() => (showSetCurrentModal = true)}
    onSetRamping={openSetRamping}
    onUnsetCurrent={() => (showUnsetCurrentModal = true)}
    onValidate={handleValidateConnection}
    onDelete={() => (showDeleteVersionModal = true)}
  />
</tr>

{#if expanded}
  <tr class="surface-primary border-y border-subtle">
    <td colspan={6} class="!p-1">
      <VersionRowDetails
        {namespace}
        {deploymentName}
        buildId={versionBuildId}
      />
    </td>
  </tr>
{/if}

<SetCurrentVersionModal
  buildId={versionBuildId}
  {currentBuildId}
  {deploymentName}
  open={showSetCurrentModal}
  error={setCurrentError}
  onConfirm={handleSetCurrentVersion}
  onCancel={() => {
    showSetCurrentModal = false;
    setCurrentError = '';
  }}
/>

<SetRampingVersionModal
  buildId={versionBuildId}
  {deploymentName}
  open={showSetRampingModal}
  error={setRampingError}
  loading={setRampingLoading}
  hasActivePollers={canRampToVersion}
  {isRamping}
  existingRampingVersion={otherVersionRamping}
  existingRampingPercentage={routingConfig.rampingVersionPercentage}
  currentPercentage={isRamping
    ? (routingConfig.rampingVersionPercentage ?? undefined)
    : undefined}
  bind:percentage={rampingPercentage}
  onConfirm={handleSetRamping}
  onRemove={handleRemoveRamping}
  onCancel={() => {
    showSetRampingModal = false;
    setRampingError = '';
  }}
/>

<ValidateConnectionModal
  buildId={versionBuildId}
  bind:open={showValidateModal}
  loading={validateLoading}
  result={validateResult}
  onClose={() => (showValidateModal = false)}
  onRetry={handleValidateConnection}
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

<Modal
  id="unset-current-version-modal"
  open={showUnsetCurrentModal}
  confirmText={translate('common.confirm')}
  cancelText={translate('common.cancel')}
  on:confirmModal={handleUnsetCurrentVersion}
  on:cancelModal={() => {
    showUnsetCurrentModal = false;
    unsetCurrentError = '';
  }}
>
  <h3 slot="title">{translate('deployments.unset-current')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <p class="text-sm">{translate('deployments.unset-current-description')}</p>
    {#if unsetCurrentError}
      <p class="text-sm text-danger">{unsetCurrentError}</p>
    {/if}
  </div>
</Modal>
