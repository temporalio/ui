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
</script>

<ServerlessWorkerCreateForm
  {namespace}
  submitButtonText={translate('workers.create-serverless-worker')}
  cancelHref={routeForWorkers({ namespace })}
  {onSuccess}
  onSubmit={async (data): Promise<SubmitFieldErrors | void> => {
    let caughtError: string | undefined;

    const deploymentResponse = await createWorkerDeployment(
      { namespace, deploymentName: data.name },
      (err) => {
        caughtError =
          err.body?.message || err.statusText || 'Failed to create deployment';
      },
    );
    if (caughtError) throw new Error(caughtError);

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

    let versionError: string | undefined;
    await createWorkerDeploymentVersion(
      {
        namespace,
        deploymentVersion: { deploymentName: data.name, buildId: data.buildId },
        computeConfig,
      },
      (err) => {
        versionError =
          err.body?.message ||
          err.statusText ||
          'Failed to create deployment version';
      },
    );

    if (versionError) {
      let rollbackMessage = versionError;
      await deleteWorkerDeployment(
        {
          namespace,
          deploymentName: data.name,
          conflictToken: deploymentResponse.conflictToken,
        },
        () => {
          rollbackMessage =
            'Failed to create deployment version. The deployment could not be cleaned up automatically — delete it manually from the deployments list.';
        },
      );
      throw new Error(rollbackMessage);
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
        if (err.status === 501) return;
        validateError =
          err.body?.message ||
          err.statusText ||
          'Failed to validate compute config';
      },
    );

    if (!validateError && (!validation || validation.valid !== false)) {
      return;
    }

    const message =
      validation?.message ?? validateError ?? 'Invalid compute configuration';

    let rollbackFailed = false;
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName: data.name, buildId: data.buildId },
      () => {
        rollbackFailed = true;
      },
    );
    if (!rollbackFailed) {
      await deleteWorkerDeployment(
        {
          namespace,
          deploymentName: data.name,
          conflictToken: deploymentResponse.conflictToken,
        },
        () => {
          rollbackFailed = true;
        },
      );
    }

    if (rollbackFailed) {
      throw new Error(
        'Compute config validation failed and resources could not be cleaned up automatically. Delete the deployment and version manually, then try again.',
      );
    }

    const lower = message.toLowerCase();
    if (lower.includes('lambda')) return { lambdaArn: [message] };
    if (lower.includes('iam') || lower.includes('role'))
      return { iamRoleArn: [message] };
    throw new Error(message);
  }}
/>
