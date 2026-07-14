<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    routeForWorkerDeployments,
    routeForWorkerDeploymentVersionCreate,
    routeForWorkersWithQuery,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    deploymentName: string;
    showInstancesLink?: boolean;
    onDeleteClick: () => void;
    onRampToUnversioned: () => void;
  }

  let {
    namespace,
    deploymentName,
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
    <Link href={routeForWorkerDeployments({ namespace })} icon="chevron-left">
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
      <Button
        href={routeForWorkerDeploymentVersionCreate({
          namespace,
          deployment: deploymentName,
        })}
      >
        {translate('deployments.create-new-version')}
      </Button>
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
          <MenuItem onclick={onRampToUnversioned}>
            {translate('deployments.ramp-to-unversioned')}
          </MenuItem>
          <MenuItem onclick={onDeleteClick} destructive>
            {translate('deployments.delete-deployment')}
          </MenuItem>
        </Menu>
      </MenuContainer>
    </div>
  </div>
</header>
