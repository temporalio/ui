<script lang="ts">
  import ServerlessWorkerCreateForm from '$lib/components/workers/serverless-worker-form/serverless-worker-create-form.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    buildLambdaComputeConfig,
    createWorkerDeployment,
    createWorkerDeploymentVersion,
    deleteWorkerDeployment,
    deleteWorkerDeploymentVersion,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import { routeForWorkers } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    onSuccess: () => void;
  }

  type SubmitFieldErrors = {
    lambdaArn?: string[];
    iamRoleArn?: string[];
  };

  let { namespace, onSuccess }: Props = $props();

  let error = $state<string | undefined>();
</script>

<ServerlessWorkerCreateForm
  {namespace}
  submitButtonText={translate('workers.create-serverless-worker')}
  cancelHref={routeForWorkers({ namespace })}
  {error}
  onSubmit={async (data): Promise<SubmitFieldErrors | void> => {
    error = undefined;

    const deploymentResponse = await createWorkerDeployment(
      { namespace, deploymentName: data.name },
      (err) => {
        error = err.statusText || 'Failed to create deployment';
      },
    );
    if (error) return;

    const computeConfig = buildLambdaComputeConfig(
      data.lambdaArn,
      data.iamRoleArn,
      {
        maxWorkers: data.maxWorkers,
        maxConcurrentActivities: data.maxConcurrentActivities,
        maxTaskQueueRate: data.maxTaskQueueRate,
        idleTimeoutSeconds: data.idleTimeoutSeconds,
      },
    );

    await createWorkerDeploymentVersion(
      {
        namespace,
        deploymentVersion: { deploymentName: data.name, buildId: data.buildId },
        computeConfig,
      },
      (err) => {
        error = err.statusText || 'Failed to create deployment version';
        console.error('createWorkerDeploymentVersion failed:', err);
      },
    );

    if (error) {
      await deleteWorkerDeployment(
        {
          namespace,
          deploymentName: data.name,
          conflictToken: deploymentResponse.conflictToken,
        },
        (rollbackErr) => {
          error =
            'Failed to create deployment version. The deployment could not be cleaned up automatically — delete it manually from the deployments list.';
          console.error('Rollback deleteWorkerDeployment failed:', rollbackErr);
        },
      );
      return;
    }

    let validateError: string | undefined;
    const validation = await validateWorkerDeploymentVersionComputeConfig(
      {
        namespace,
        deploymentName: data.name,
        buildId: data.buildId,
        computeConfig,
      },
      (err) => {
        if (err.status === 501 || err.statusText?.includes('Unimplemented'))
          return;
        validateError = err.statusText || 'Failed to validate compute config';
      },
    );

    if (!validateError && (!validation || validation.valid !== false)) {
      onSuccess();
      return;
    }

    const message =
      validation?.message ?? validateError ?? 'Invalid compute configuration';

    let rollbackFailed = false;
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName: data.name, buildId: data.buildId },
      (rollbackErr) => {
        rollbackFailed = true;
        console.error(
          'Rollback deleteWorkerDeploymentVersion failed:',
          rollbackErr,
        );
      },
    );
    if (!rollbackFailed) {
      await deleteWorkerDeployment(
        {
          namespace,
          deploymentName: data.name,
          conflictToken: deploymentResponse.conflictToken,
        },
        (rollbackErr) => {
          rollbackFailed = true;
          console.error('Rollback deleteWorkerDeployment failed:', rollbackErr);
        },
      );
    }

    if (rollbackFailed) {
      error =
        'Compute config validation failed and resources could not be cleaned up automatically. Delete the deployment and version manually, then try again.';
      return;
    }

    const lower = message.toLowerCase();
    if (lower.includes('lambda')) {
      return { lambdaArn: [message] };
    }
    if (lower.includes('iam') || lower.includes('role')) {
      return { iamRoleArn: [message] };
    }
    error = message;
  }}
/>
