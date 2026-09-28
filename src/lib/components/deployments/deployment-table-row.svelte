<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconEllipsisVertical } from '$lib/io/icon';
  import {
    deleteWorkerDeployment,
    fetchDeployment,
  } from '$lib/services/deployments-service';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { ListWorkerDeployment } from '$lib/types/deployments';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { parseVersionStatus } from '$lib/utilities/deployments';
  import {
    routeForWorkerDeployment,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import DeleteDeploymentModal from './delete-deployment-modal.svelte';
  import DeploymentStatus from './deployment-status.svelte';
  import VersionRegions from './version-regions.svelte';

  interface Props {
    deployment: ListWorkerDeployment;
    columns: ConfigurableTableHeader[];
    showConnectionStatus?: boolean;
    /** Regions the namespace runs in, primary first. */
    namespaceRegions?: readonly string[];
    onChange?: () => void;
  }
  let {
    deployment,
    columns,
    showConnectionStatus = true,
    namespaceRegions,
    onChange,
  }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const hasVersions = $derived(
    !!deployment.latestVersionSummary?.deploymentVersion,
  );

  let showDeleteModal = $state(false);
  let deleteError = $state('');
  let conflictToken = $state<string | undefined>(undefined);

  async function openDeleteModal() {
    showDeleteModal = true;
    const result = await fetchDeployment({
      namespace,
      deploymentName: deployment.name,
    });
    conflictToken = result.conflictToken;
  }

  async function handleDelete() {
    deleteError = '';
    await deleteWorkerDeployment(
      { namespace, deploymentName: deployment.name, conflictToken },
      (err) => {
        deleteError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.delete-deployment-confirm-error');
      },
    );
    if (deleteError) return;
    showDeleteModal = false;
    onChange?.();
  }

  const currentBuildId = $derived(
    deployment?.currentVersionSummary?.deploymentVersion?.buildId,
  );

  const currentScalingGroup = $derived(
    Object.values(
      deployment.currentVersionSummary?.computeConfig?.scalingGroups ?? {},
    )[0],
  );
  const currentComputeProviderType = $derived(
    currentScalingGroup?.providerType ?? currentScalingGroup?.provider?.type,
  );

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
  const latestScalingGroup = $derived(
    Object.values(
      deployment.latestVersionSummary?.computeConfig?.scalingGroups ?? {},
    )[0],
  );
  const latestComputeProviderType = $derived(
    latestScalingGroup?.providerType ?? latestScalingGroup?.provider?.type,
  );
  const isSameAsCurrent = $derived(
    !!latestBuildId && latestBuildId === currentBuildId,
  );
</script>

<tr>
  {#each columns as { label, width } (label)}
    {@const widthStyle = columnWidthStyle(width)}
    {@const clampToWidth = width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES}
    {#if label === 'Deployment'}
      <td class={twMerge('py-1 text-left', clampToWidth)} style={widthStyle}>
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
    {:else if label === 'Current Version'}
      <td class={twMerge('py-1 text-left', clampToWidth)} style={widthStyle}>
        {#if currentBuildId}
          {@const href =
            routeForWorkflowsWithQuery({
              namespace: page.params.namespace,
              query: `TemporalWorkerDeploymentVersion="${deployment.name}:${currentBuildId}"`,
            }) ?? ''}
          <div class="flex flex-wrap items-center gap-2">
            <Link {href}>{currentBuildId}</Link>
            {#if currentComputeProviderType}
              <VersionRegions
                computeConfig={deployment.currentVersionSummary?.computeConfig}
                {namespaceRegions}
                computeStatus={deployment.currentVersionSummary?.computeStatus}
                {showConnectionStatus}
              />
            {/if}
          </div>
        {:else}
          <span class="text-secondary"
            >{translate('deployments.unversioned')}</span
          >
        {/if}
      </td>
    {:else if label === 'Latest Version'}
      <td class={twMerge('py-1 text-left', clampToWidth)} style={widthStyle}>
        {#if isSameAsCurrent}
          <span
            class="inline-flex items-center border border-primary px-2 py-0.5 text-secondary"
          >
            {translate('deployments.same-as-current')}
          </span>
        {:else if latestBuildId}
          {@const href =
            routeForWorkflowsWithQuery({
              namespace: page.params.namespace,
              query: `TemporalWorkerDeploymentVersion="${deployment.name}:${latestBuildId}"`,
            }) ?? ''}
          <div class="flex flex-wrap items-center gap-2">
            <Link {href}>{latestBuildId}</Link>
            {#if latestVersionStatus}
              <DeploymentStatus
                status={latestVersionStatus.status}
                label={latestVersionStatus.label}
              />
            {/if}
            {#if latestComputeProviderType}
              <VersionRegions
                computeConfig={deployment.latestVersionSummary?.computeConfig}
                {namespaceRegions}
              />
            {/if}
          </div>
        {:else}
          <span class="text-secondary">—</span>
        {/if}
      </td>
    {:else if label === 'Created At'}
      <td
        class={twMerge('truncate py-1 text-left', clampToWidth)}
        style={widthStyle}
      >
        <Timestamp as="p" dateTime={deployment.createTime} />
      </td>
    {/if}
  {/each}
  <td class="w-24 whitespace-pre-line break-words">
    <MenuContainer>
      <MenuButton
        label={translate('deployments.actions')}
        controls="deployment-actions-{deployment.name}"
        variant="ghost"
        size="xs"
        class="flex h-8 w-8 items-center justify-center"
      >
        <IconEllipsisVertical class="h-4 w-4" />
      </MenuButton>
      <Menu
        id="deployment-actions-{deployment.name}"
        position="right"
        usePortal
      >
        <MenuItem onclick={openDeleteModal} destructive>
          {translate('common.delete')}
        </MenuItem>
      </Menu>
    </MenuContainer>
  </td>
</tr>

<DeleteDeploymentModal
  open={showDeleteModal}
  deploymentName={deployment.name}
  {hasVersions}
  error={deleteError}
  onConfirm={handleDelete}
  onCancel={() => {
    showDeleteModal = false;
    deleteError = '';
  }}
/>
