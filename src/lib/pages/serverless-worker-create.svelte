<script lang="ts">
  import ServerlessWorkerCreateForm from '$lib/components/workers/serverless-worker-form/serverless-worker-create-form.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    buildLambdaComputeConfig,
    createWorkerDeployment,
    createWorkerDeploymentVersion,
    deleteWorkerDeployment,
    deleteWorkerDeploymentVersion,
    setCurrentDeploymentVersion,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import { routeForWorkers } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    onSuccess: () => void;
    cfnTemplate?: string;
  }

  interface SubmitFieldErrors {
    lambdaArn?: string[];
    iamRoleArn?: string[];
    roleExternalId?: string[];
  }

  let { namespace, onSuccess, cfnTemplate }: Props = $props();
</script>

<ServerlessWorkerCreateForm
  submitButtonText={translate('workers.create-serverless-worker')}
  cancelHref={routeForWorkers({ namespace })}
  {onSuccess}
  {cfnTemplate}
  onSubmit={async (data): Promise<SubmitFieldErrors | void> => {
    let caughtError: string | undefined;

    const deploymentResponse = await createWorkerDeployment(
      { namespace, deploymentName: data.name },
      (err) => {
        caughtError =
          err.body?.message ||
          err.statusText ||
          translate('deployments.failed-to-create-deployment');
      },
    );
    if (caughtError) throw new Error(caughtError);

    const computeConfig = buildLambdaComputeConfig(
      data.lambdaArn,
      data.iamRoleArn,
      {
        roleExternalId: data.roleExternalId,
        scaleUpCooloffMs: data.scaleUpCooloffMs,
        scaleUpBacklogThreshold: data.scaleUpBacklogThreshold,
        maxWorkerLifetimeMs: data.maxWorkerLifetimeMs,
        scaleUpDispatchRateEpsilon: data.scaleUpDispatchRateEpsilon,
        metricsPollIntervalMs: data.metricsPollIntervalMs,
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
          translate('deployments.failed-to-create-version');
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
          rollbackMessage = translate(
            'deployments.failed-to-create-version-rollback-failed',
          );
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
          translate('deployments.failed-to-validate-compute-config');
      },
    );

    if (!validateError && (!validation || validation.valid !== false)) {
      await setCurrentDeploymentVersion({
        namespace,
        deploymentName: data.name,
        buildId: data.buildId,
      });
      return;
    }

    const message =
      validation?.message ??
      validateError ??
      translate('deployments.invalid-compute-configuration');

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
        translate('deployments.validation-failed-cleanup-failed'),
      );
    }

    const lower = message.toLowerCase();
    if (lower.includes('lambda')) return { lambdaArn: [message] };
    if (lower.includes('iam') || lower.includes('role'))
      return { iamRoleArn: [message] };
    throw new Error(message);
  }}
/>
