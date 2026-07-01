<script lang="ts">
  import { page } from '$app/state';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeployment,
    fetchDeployment,
  } from '$lib/services/deployments-service';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { WorkerDeploymentSummary } from '$lib/types/deployments';
  import {
    routeForWorkerDeployment,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import ComputeBadge from './compute-badge.svelte';
  import DeleteDeploymentModal from './delete-deployment-modal.svelte';

  interface Props {
    deployment: WorkerDeploymentSummary;
    columns: ConfigurableTableHeader[];
    onChange?: () => void;
  }
  let { deployment, columns, onChange }: Props = $props();

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
    {:else if label === translate('deployments.current-version')}
      <td class="py-1 text-left">
        {#if currentBuildId}
          <div class="flex items-center gap-2">
            <Copyable
              container-class="min-w-32 shrink-0"
              content={currentBuildId}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            >
              <Link
                href={routeForWorkflowsWithQuery({
                  namespace: page.params.namespace,
                  query: `TemporalWorkerDeploymentVersion="${deployment.name}:${currentBuildId}"`,
                }) ?? ''}
              >
                {currentBuildId}
              </Link>
            </Copyable>
            <CapabilityGuard capability="serverScaledDeployments">
              {#if currentComputeProviderType}
                <ComputeBadge
                  type={currentComputeProviderType}
                  computeStatus={deployment.currentVersionSummary
                    ?.computeStatus}
                />
              {/if}
            </CapabilityGuard>
          </div>
        {:else}
          <span class="text-secondary"
            >{translate('deployments.unversioned')}</span
          >
        {/if}
      </td>
    {:else if label === translate('deployments.created')}
      <td class="truncate py-1 text-left">
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
        <Icon name="vertical-ellipsis" class="h-4 w-4" />
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
