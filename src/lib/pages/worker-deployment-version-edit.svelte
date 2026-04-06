<script lang="ts">
  import { goto } from '$app/navigation';

  import DeleteWorkerModal from '$lib/components/workers/delete-worker-modal.svelte';
  import EditVersionForm from '$lib/components/workers/serverless-worker-form/edit-version-form.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    decodeLambdaProviderDetails,
    decodeScalerDetails,
    deleteWorkerDeploymentVersion,
    fetchDeploymentVersion,
  } from '$lib/services/deployments-service';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    deployment: string;
    buildId: string;
  }

  let { namespace, deployment, buildId }: Props = $props();

  let error = $state<string | undefined>();
  let showDeleteModal = $state(false);

  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );
  const versionFetch = $derived(
    fetchDeploymentVersion({ namespace, deploymentName: deployment, buildId }),
  );
</script>

{#await versionFetch}
  <SkeletonTable rows={6} />
{:then versionResponse}
  {@const info = versionResponse.workerDeploymentVersionInfo}
  {@const providerDetails = decodeLambdaProviderDetails(info.computeConfig)}
  {@const scalerDetails = decodeScalerDetails(info.computeConfig)}
  <div class="flex flex-col gap-4">
    <Link href={backHref} icon="chevron-left">
      {translate('workers.back-to-deployment', { deployment })}
    </Link>
    <h1 class="text-2xl font-semibold">
      {translate('workers.edit-version-title-with-id', { buildId })}
    </h1>
    {#if error}
      <Alert intent="error" title={translate('common.error-occurred')}
        >{error}</Alert
      >
    {/if}
    <EditVersionForm
      initialData={{
        lambdaArn: providerDetails.lambdaArn ?? '',
        iamRoleArn: providerDetails.iamRoleArn ?? '',
        roleExternalId: providerDetails.roleExternalId ?? '',
        scaleUpCooloffMs: scalerDetails.scaleUpCooloffMs,
        scaleUpBacklogThreshold: scalerDetails.scaleUpBacklogThreshold,
        maxWorkerLifetimeMs: scalerDetails.maxWorkerLifetimeMs,
        scaleUpDispatchRateEpsilon: scalerDetails.scaleUpDispatchRateEpsilon,
        metricsPollIntervalMs: scalerDetails.metricsPollIntervalMs,
      }}
      cancelHref={backHref}
      onSubmit={async (_data) => {
        error = translate('workers.update-compute-config-unavailable');
      }}
      onDelete={() => {
        showDeleteModal = true;
      }}
    />
  </div>
{:catch err}
  <Alert intent="warning" title={translate('common.error-occurred')}>
    {err?.message ?? translate('common.unknown-error')}
  </Alert>
{/await}

<DeleteWorkerModal
  open={showDeleteModal}
  workerName={buildId}
  onConfirm={async () => {
    showDeleteModal = false;
    error = undefined;
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName: deployment, buildId },
      (err) => {
        error = err.statusText || translate('workers.delete-version-error');
      },
    );
    if (!error) goto(backHref);
  }}
  onCancel={() => {
    showDeleteModal = false;
  }}
/>
