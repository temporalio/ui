<script lang="ts">
  import { goto } from '$app/navigation';

  import ServerlessWorkerEditForm from '$lib/components/workers/serverless-worker-form/serverless-worker-edit-form.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import {
    routeForWorkerDeployment,
    routeForWorkerDeployments,
  } from '$lib/utilities/route-for';

  type Props = { id: string; namespace: string };
  let { id, namespace }: Props = $props();

  const deploymentFetch = $derived(
    fetchDeployment({ namespace, deploymentName: id }),
  );

  const detailHref = $derived(
    routeForWorkerDeployment({ namespace, deployment: id }),
  );
</script>

{#await deploymentFetch}
  <SkeletonTable rows={6} />
{:then deployment}
  {@const info = deployment.workerDeploymentInfo}
  {@const computeConfig = info.computeConfig}
  {@const defaultGroup = computeConfig?.scalingGroups
    ? Object.values(computeConfig.scalingGroups)[0]
    : undefined}
  {@const providerDetail = defaultGroup?.provider?.details?.data
    ? (JSON.parse(atob(defaultGroup.provider.details.data)) as {
        lambdaArn?: string;
        iamRoleArn?: string;
        region?: string;
      })
    : {}}
  {@const scalerDetail = defaultGroup?.scaler?.details?.data
    ? (JSON.parse(atob(defaultGroup.scaler.details.data)) as {
        maxInstances?: number;
        minInstances?: number;
      })
    : {}}
  {@const worker = {
    id: info.name,
    name: info.name,
    status: 'running' as const,
    compute: 'Lambda' as const,
    lastHeartbeat: '',
    sdkVersion: '',
    createdAt: '',
    updatedAt: '',
    lambdaArn: providerDetail.lambdaArn ?? '',
    iamRoleArn: providerDetail.iamRoleArn ?? '',
    region: providerDetail.region ?? '',
    taskQueue: '',
    maxWorkers: scalerDetail.maxInstances ?? 0,
    maxConcurrentActivities: 0,
    maxTaskQueueActivitiesPerSecond: 0,
    idleTimeoutSeconds: 0,
  }}
  <ServerlessWorkerEditForm
    {namespace}
    {worker}
    submitButtonText={translate('workers.save-changes')}
    cancelHref={detailHref}
    onSubmit={() => {
      goto(detailHref);
    }}
    onDelete={() => {
      goto(routeForWorkerDeployments({ namespace }));
    }}
  />
{:catch error}
  <Alert intent="warning" title={translate('common.error-occurred')}>
    {error?.message ?? translate('common.unknown-error')}
  </Alert>
{/await}
