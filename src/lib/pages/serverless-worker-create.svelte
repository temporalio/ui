<script lang="ts">
  import ServerlessWorkerCreateForm from '$lib/components/workers/serverless-worker-form/serverless-worker-create-form.svelte';
  import type { CreateDeploymentFormData } from '$lib/components/workers/serverless-worker-form/shared';
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

  async function rollbackDeployment(
    deploymentName: string,
    conflictToken: string | undefined,
  ): Promise<boolean> {
    let failed = false;
    await deleteWorkerDeployment(
      { namespace, deploymentName, conflictToken },
      () => {
        failed = true;
      },
    );
    return !failed;
  }

  async function rollbackAll(
    deploymentName: string,
    buildId: string,
    conflictToken: string | undefined,
  ): Promise<boolean> {
    let failed = false;
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName, buildId },
      () => {
        failed = true;
      },
    );
    if (failed) return false;
    return rollbackDeployment(deploymentName, conflictToken);
  }

  async function handleCreate(
    data: CreateDeploymentFormData,
  ): Promise<SubmitFieldErrors | void> {
    let deploymentError: string | undefined;
    const deployment = await createWorkerDeployment(
      { namespace, deploymentName: data.name },
      (err) => {
        deploymentError =
          err.body?.message ||
          err.statusText ||
          translate('deployments.failed-to-create-deployment');
      },
    );
    if (deploymentError) throw new Error(deploymentError);

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
      const cleaned = await rollbackDeployment(
        data.name,
        deployment.conflictToken,
      );
      throw new Error(
        cleaned
          ? versionError
          : translate('deployments.failed-to-create-version-rollback-failed'),
      );
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
      let setCurrentError: string | undefined;
      await setCurrentDeploymentVersion(
        { namespace, deploymentName: data.name, buildId: data.buildId },
        (err) => {
          setCurrentError =
            err.body?.message ||
            err.statusText ||
            translate('deployments.failed-to-set-current-version');
        },
      );
      if (!setCurrentError) return;

      const cleaned = await rollbackAll(
        data.name,
        data.buildId,
        deployment.conflictToken,
      );
      throw new Error(
        cleaned
          ? setCurrentError
          : translate(
              'deployments.failed-to-set-current-version-cleanup-failed',
            ),
      );
    }

    const message =
      validation?.message ??
      validateError ??
      translate('deployments.invalid-compute-configuration');

    const cleaned = await rollbackAll(
      data.name,
      data.buildId,
      deployment.conflictToken,
    );
    if (!cleaned)
      throw new Error(
        translate('deployments.validation-failed-cleanup-failed'),
      );

    const lower = message.toLowerCase();
    if (lower.includes('lambda')) return { lambdaArn: [message] };
    if (lower.includes('iam') || lower.includes('role'))
      return { iamRoleArn: [message] };
    throw new Error(message);
  }
</script>

<ServerlessWorkerCreateForm
  submitButtonText={translate('common.save')}
  cancelHref={routeForWorkers({ namespace })}
  {onSuccess}
  {cfnTemplate}
  onSubmit={handleCreate}
/>
