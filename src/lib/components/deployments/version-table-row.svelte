<script lang="ts">
  import { writable } from 'svelte/store';

  import { invalidateAll } from '$app/navigation';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { Menu, MenuContainer, MenuItem } from '$lib/holocene/menu';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeploymentVersion,
    fetchDeploymentVersion,
    setCurrentDeploymentVersion,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import {
    isVersionSummaryNew,
    type RoutingConfig,
    type VersionSummary,
    type WorkerDeploymentVersionResponse,
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
  import DeploymentStatus from './deployment-status.svelte';
  import VersionComputeDetails from './version-compute-details.svelte';

  type Props = {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    namespace: string;
    deploymentName: string;
    conflictToken?: string;
  };
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

  const status = $derived(
    isCurrent
      ? translate('deployments.current')
      : isRamping
        ? translate('deployments.ramping')
        : isVersionSummaryNew(version)
          ? parseVersionStatus(drainageStatus).status
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
        : isVersionSummaryNew(version)
          ? parseVersionStatus(drainageStatus).label
          : drainageStatus
            ? fromScreamingEnum(drainageStatus, statusEnum)
            : translate('common.inactive'),
  );

  const computeProviderType = $derived(
    isVersionSummaryNew(version) && version.computeConfig
      ? Object.values(version.computeConfig.scalingGroups ?? {})[0]?.provider
          ?.type
      : undefined,
  );

  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeploymentVersion="${getDeploymentVersionFromStruct(version)}"`,
    }),
  );

  const editHref = $derived(
    routeForWorkerDeploymentVersionEdit({
      namespace,
      deployment: versionDeploymentName,
      buildId: versionBuildId,
    }),
  );

  let expanded = $state(false);
  let fetchPromise = $state<Promise<WorkerDeploymentVersionResponse> | null>(
    null,
  );
  let showDeleteVersionModal = $state(false);
  let showValidateModal = $state(false);
  let validateLoading = $state(false);
  let validateResult = $state<{ valid: boolean; message?: string } | null>(
    null,
  );
  let setCurrentError = $state<string | null>(null);
  const menuOpen = writable(false);

  $effect(() => {
    if (expanded && !fetchPromise) {
      fetchPromise = fetchDeploymentVersion({
        namespace,
        deploymentName,
        buildId: versionBuildId,
      });
    }
  });

  async function handleSetCurrent() {
    setCurrentError = null;
    await setCurrentDeploymentVersion(
      { namespace, deploymentName, buildId: versionBuildId },
      () => {
        setCurrentError = translate('deployments.set-as-current-error');
      },
    );
    if (!setCurrentError) {
      await invalidateAll();
    }
  }

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
        validateResult = {
          valid: false,
          message: translate('deployments.validate-connection-error'),
        };
      },
    );
    validateLoading = false;
  }

  async function handleDeleteVersion() {
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName, buildId: versionBuildId, conflictToken },
      () => {},
    );
    showDeleteVersionModal = false;
    await invalidateAll();
  }
</script>

<tr>
  <td class="text-left">
    <div class="flex items-center gap-1">
      <button
        type="button"
        aria-label={expanded ? 'Collapse' : 'Expand'}
        onclick={() => (expanded = !expanded)}
        class="shrink-0"
      >
        <Icon
          name="chevron-right"
          class="h-4 w-4 transition-transform {expanded ? 'rotate-90' : ''}"
        />
      </button>
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
    <span class="text-secondary">—</span>
  </td>
  <td class="text-left">
    <ComputeBadge type={computeProviderType} />
  </td>
  <Timestamp
    as="td"
    class="whitespace-pre-line break-words text-left"
    dateTime={version?.createTime}
  />
  <td class="w-24 whitespace-pre-line break-words">
    <MenuContainer open={menuOpen}>
      {#snippet children(open)}
        <button
          type="button"
          aria-label="Actions"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls="version-actions-{versionBuildId}"
          onclick={() => menuOpen.update((v) => !v)}
          class="flex h-8 w-8 items-center justify-center rounded hover:surface-interactive-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          <Icon name="vertical-ellipsis" class="h-4 w-4" />
        </button>
        <Menu id="version-actions-{versionBuildId}" position="right">
          <MenuItem href={editHref}>
            {translate('deployments.edit')}
          </MenuItem>
          <MenuItem onclick={handleValidateConnection}>
            {translate('deployments.validate-connection')}
          </MenuItem>
          <MenuItem href={workflowHref}>
            {translate('deployments.view-workflows')}
          </MenuItem>
          <MenuItem onclick={() => (showDeleteVersionModal = true)}>
            {translate('common.delete')}
          </MenuItem>
        </Menu>
      {/snippet}
    </MenuContainer>
  </td>
</tr>

{#if expanded}
  <tr class="surface-primary border-y border-subtle">
    <td colspan={6} class="!p-1">
      {#await fetchPromise}
        <div class="surface-secondary flex flex-col gap-2 py-3 pl-6 text-xs">
          {#each [1, 2, 3] as _ (_)}
            <div class="flex items-center gap-2">
              <div class="h-3 w-20 animate-pulse rounded bg-subtle"></div>
              <div class="h-3 w-64 animate-pulse rounded bg-subtle"></div>
            </div>
          {/each}
        </div>
      {:then result}
        {#if result}
          <VersionComputeDetails
            computeConfig={result.workerDeploymentVersionInfo.computeConfig}
          />
        {/if}
      {:catch err}
        <div class="flex items-center gap-2 py-2 text-xs">
          <span class="text-danger"
            >{err?.message ?? 'Failed to load version details'}</span
          >
          <button
            type="button"
            class="text-primary underline"
            onclick={() => {
              fetchPromise = fetchDeploymentVersion({
                namespace,
                deploymentName,
                buildId: versionBuildId,
              });
            }}>Retry</button
          >
        </div>
      {/await}
    </td>
  </tr>
{/if}

<Modal
  id="validate-connection-modal-{versionBuildId}"
  open={showValidateModal}
  confirmText={translate('common.close')}
  cancelText={translate('common.cancel')}
  on:confirmModal={() => (showValidateModal = false)}
  on:cancelModal={() => (showValidateModal = false)}
>
  <h3 slot="title">{translate('deployments.validate-connection')}</h3>
  <div slot="content">
    {#if validateLoading}
      <div class="flex flex-col gap-2">
        <div class="h-3 w-32 animate-pulse rounded bg-subtle"></div>
        <div class="h-3 w-48 animate-pulse rounded bg-subtle"></div>
      </div>
    {:else if validateResult}
      <p class="text-sm">
        {validateResult.valid !== false
          ? translate('deployments.validate-connection-valid')
          : translate('deployments.validate-connection-invalid')}
      </p>
      {#if validateResult.message}
        <p class="mt-1 text-sm text-secondary">{validateResult.message}</p>
      {/if}
    {/if}
  </div>
</Modal>

<Modal
  id="delete-version-modal-{versionBuildId}"
  open={showDeleteVersionModal}
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  confirmType="destructive"
  on:confirmModal={handleDeleteVersion}
  on:cancelModal={() => (showDeleteVersionModal = false)}
>
  <h3 slot="title">{translate('deployments.delete-version')}</h3>
  <div slot="content" class="flex flex-col gap-2">
    <p class="text-sm">{translate('deployments.delete-version-confirm')}</p>
    <p class="text-sm">{translate('deployments.delete-version-description')}</p>
  </div>
</Modal>
