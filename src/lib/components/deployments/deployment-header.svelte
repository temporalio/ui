<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft } from '$lib/io/icon';
  import {
    routeForWorkerDeployments,
    routeForWorkerDeploymentVersionCreate,
    routeForWorkersWithQuery,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    deploymentName: string;
    hasComputeConfig: boolean;
    showInstancesLink?: boolean;
    onDeleteClick: () => void;
    onRampToUnversioned: () => void;
  }

  let {
    namespace,
    deploymentName,
    hasComputeConfig,
    showInstancesLink = true,
    onDeleteClick,
    onRampToUnversioned,
  }: Props = $props();

  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeployment="${deploymentName}"`,
    }),
  );

  const instancesHref = $derived(
    routeForWorkersWithQuery({
      namespace,
      query: `\`DeploymentName\`="${deploymentName}"`,
    }) ?? '',
  );
</script>

<header class="flex flex-col gap-4">
  <div class="flex items-center gap-2 text-sm">
    <Link
      href={routeForWorkerDeployments({ namespace })}
      LeadingIcon={IconChevronLeft}
    >
      {translate('deployments.back-to-deployments')}
    </Link>
    {#if showInstancesLink}
      <span class="text-secondary">|</span>
      <Link href={instancesHref}>
        {translate('deployments.go-to-instances')}
      </Link>
    {/if}
  </div>

  <div class="flex w-full items-center justify-between">
    <h1>{deploymentName}</h1>
    <div class="flex items-center gap-4">
      {#if hasComputeConfig}
        <Button
          href={routeForWorkerDeploymentVersionCreate({
            namespace,
            deployment: deploymentName,
          })}
        >
          {translate('deployments.create-new-version')}
        </Button>
      {/if}
      <MenuContainer>
        <MenuButton
          controls="deployment-header-actions"
          variant="secondary"
          hasIndicator
        >
          {translate('deployments.more-actions')}
        </MenuButton>
        <Menu id="deployment-header-actions" position="right" usePortal>
          <MenuItem href={workflowHref}>
            {translate('deployments.view-workflows')}
          </MenuItem>
          {#if hasComputeConfig}
            <MenuItem onclick={onRampToUnversioned}>
              {translate('deployments.ramp-to-unversioned')}
            </MenuItem>
          {/if}
          <MenuItem onclick={onDeleteClick} destructive>
            {translate('deployments.delete-deployment')}
          </MenuItem>
        </Menu>
      </MenuContainer>
    </div>
  </div>
</header>
