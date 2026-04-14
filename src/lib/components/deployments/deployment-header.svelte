<script lang="ts">
  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
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
    hasVersions: boolean;
    onDeleteClick: () => void;
  }

  let { namespace, deploymentName, hasVersions, onDeleteClick }: Props =
    $props();

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
    <span class="text-secondary">|</span>
    <Link href={instancesHref}>
      {translate('deployments.go-to-instances')}
    </Link>
  </div>

  <div class="flex w-full items-center justify-between">
    <h1 class="text-2xl font-semibold">{deploymentName}</h1>
    <div class="flex items-center gap-2">
      <Button variant="secondary" href={workflowHref}>
        {translate('deployments.view-workflows')}
      </Button>
      <CapabilityGuard capability="serverScaledDeployments">
        <Button
          href={routeForWorkerDeploymentVersionCreate({
            namespace,
            deployment: deploymentName,
          })}
        >
          {translate('deployments.create-new-version')}
        </Button>
      </CapabilityGuard>
      {#if !hasVersions}
        <CapabilityGuard capability="serverScaledDeployments">
          <Button variant="destructive" on:click={onDeleteClick}>
            {translate('deployments.delete-deployment')}
          </Button>
        </CapabilityGuard>
      {/if}
    </div>
  </div>
</header>
