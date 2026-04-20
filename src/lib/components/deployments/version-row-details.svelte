<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { fetchDeploymentVersion } from '$lib/services/deployments-service';

  import VersionComputeDetails from './version-compute-details.svelte';

  interface Props {
    namespace: string;
    deploymentName: string;
    buildId: string;
  }

  let { namespace, deploymentName, buildId }: Props = $props();

  let retryCount = $state(0);
  const fetchPromise = $derived.by(() => {
    void retryCount;
    return fetchDeploymentVersion({ namespace, deploymentName, buildId });
  });
</script>

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
      >{err?.message ?? translate('deployments.version-load-error')}</span
    >
    <button
      type="button"
      class="text-primary underline"
      onclick={() => {
        retryCount++;
      }}>{translate('common.retry')}</button
    >
  </div>
{/await}
