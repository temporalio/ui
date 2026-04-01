<script lang="ts">
  import ServerlessWorkerCreateForm from '$lib/components/workers/serverless-worker-form/serverless-worker-create-form.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    buildLambdaComputeConfig,
    createWorkerDeployment,
    createWorkerDeploymentVersion,
  } from '$lib/services/deployments-service';
  import { routeForWorkers } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    onSuccess: () => void;
  }

  let { namespace, onSuccess }: Props = $props();

  let error = $state<string | undefined>();
</script>

<ServerlessWorkerCreateForm
  {namespace}
  submitButtonText={translate('workers.create-serverless-worker')}
  cancelHref={routeForWorkers({ namespace })}
  {error}
  onSubmit={async (data) => {
    error = undefined;
    await createWorkerDeployment(
      { namespace, deploymentName: data.name },
      (err) => {
        error = err.statusText || 'Failed to create deployment';
      },
    );
    if (error) return;

    await createWorkerDeploymentVersion(
      {
        namespace,
        deploymentVersion: { deploymentName: data.name, buildId: data.buildId },
        computeConfig: buildLambdaComputeConfig(
          data.lambdaArn,
          data.iamRoleArn,
          {
            maxWorkers: data.maxWorkers,
            maxConcurrentActivities: data.maxConcurrentActivities,
            maxTaskQueueRate: data.maxTaskQueueRate,
            idleTimeoutSeconds: data.idleTimeoutSeconds,
          },
        ),
      },
      (err) => {
        error =
          'Deployment created but version setup failed. You can retry from the deployment detail page.';
        console.error('createWorkerDeploymentVersion failed:', err);
      },
    );
    if (!error) onSuccess();
  }}
/>
