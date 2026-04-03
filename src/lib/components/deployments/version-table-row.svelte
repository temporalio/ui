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
    decodeLambdaProviderDetails,
    decodeScalerDetails,
    deleteWorkerDeploymentVersion,
    fetchDeploymentVersion,
    setCurrentDeploymentVersion,
  } from '$lib/services/deployments-service';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
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

  type Props = {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    columns: ConfigurableTableHeader[];
    namespace: string;
    deploymentName: string;
    conflictToken?: string;
  };
  let {
    routingConfig,
    version,
    columns,
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
  {#each columns as { label } (label)}
    {#if label === translate('deployments.build-id')}
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
    {:else if label === translate('deployments.build-status')}
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
    {:else if label === translate('deployments.compute')}
      <td class="text-left">
        <ComputeBadge type={computeProviderType} />
      </td>
    {:else if label === translate('deployments.deployed')}
      <Timestamp
        as="td"
        class="whitespace-pre-line break-words text-left"
        dateTime={version?.createTime}
      />
    {:else if label === translate('deployments.actions')}
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
                {translate('deployments.edit-version')}
              </MenuItem>
              <MenuItem href={workflowHref}>
                {translate('deployments.go-to-workflows')}
              </MenuItem>
              {#if !isCurrent}
                <MenuItem onclick={handleSetCurrent}>
                  {translate('deployments.set-as-current')}
                </MenuItem>
              {/if}
              <MenuItem onclick={() => (showDeleteVersionModal = true)}>
                {translate('deployments.delete-version')}
              </MenuItem>
            </Menu>
          {/snippet}
        </MenuContainer>
      </td>
    {/if}
  {/each}
</tr>

{#if expanded}
  <tr class="surface-primary">
    <td colspan={columns.length} class="px-4 pb-3 pt-1">
      {#await fetchPromise}
        <div class="flex flex-col gap-2 py-2">
          {#each [1, 2, 3, 4] as _ (_)}
            <div class="flex items-center gap-2">
              <div class="h-4 w-40 animate-pulse rounded bg-subtle"></div>
              <div class="h-4 w-48 animate-pulse rounded bg-subtle"></div>
            </div>
          {/each}
        </div>
      {:then result}
        {#if result}
          {@const info = result.workerDeploymentVersionInfo}
          {@const lambdaDetails = decodeLambdaProviderDetails(
            info.computeConfig,
          )}
          {@const scalerParams = decodeScalerDetails(info.computeConfig)}
          {@const isCompute = !!lambdaDetails.lambdaArn}
          <div class="flex flex-col gap-2 text-sm">
            {#if isCompute}
              {#if lambdaDetails.lambdaArn}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('workers.lambda-arn-label')}</span
                  >
                  <code class="text-xs">{lambdaDetails.lambdaArn}</code>
                </div>
              {/if}
              {#if lambdaDetails.iamRoleArn}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('workers.iam-role-label')}</span
                  >
                  <code class="text-xs">{lambdaDetails.iamRoleArn}</code>
                </div>
              {/if}
              {#if lambdaDetails.roleExternalId}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('deployments.role-external-id')}</span
                  >
                  <code class="text-xs">{lambdaDetails.roleExternalId}</code>
                </div>
              {/if}
              {#if scalerParams.scaleUpCooloffMs !== undefined}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('deployments.scale-up-cooloff')}</span
                  >
                  <span>{scalerParams.scaleUpCooloffMs}ms</span>
                </div>
              {/if}
              {#if scalerParams.scaleUpBacklogThreshold !== undefined}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('deployments.backlog-threshold')}</span
                  >
                  <span>{scalerParams.scaleUpBacklogThreshold}</span>
                </div>
              {/if}
              {#if scalerParams.maxWorkerLifetimeMs !== undefined}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('deployments.max-worker-lifetime')}</span
                  >
                  <span>{scalerParams.maxWorkerLifetimeMs}ms</span>
                </div>
              {/if}
              {#if scalerParams.scaleUpDispatchRateEpsilon !== undefined}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('deployments.dispatch-rate-epsilon')}</span
                  >
                  <span>{scalerParams.scaleUpDispatchRateEpsilon}</span>
                </div>
              {/if}
              {#if scalerParams.metricsPollIntervalMs !== undefined}
                <div class="flex items-center gap-2">
                  <span class="w-40 shrink-0 text-secondary"
                    >{translate('deployments.metrics-poll-interval')}</span
                  >
                  <span>{scalerParams.metricsPollIntervalMs}ms</span>
                </div>
              {/if}
            {/if}
          </div>
        {/if}
      {:catch err}
        <div class="flex items-center gap-2 py-2 text-sm">
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
