<script lang="ts">
  import ServerlessWorkerCreateForm from '$lib/components/workers/serverless-worker-form/serverless-worker-create-form.svelte';
  import { translate } from '$lib/i18n/translate';
  import { createWorkerDeployment } from '$lib/services/deployments-service';
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
    const providerDetail = {
      lambdaArn: data.lambdaArn,
      iamRoleArn: data.iamRoleArn,
      region: data.lambdaArn?.split(':')[3] ?? '',
    };
    await createWorkerDeployment(
      {
        namespace,
        deploymentName: data.name,
        computeConfig: {
          provider: {
            type: 'lambda',
            detailJson: JSON.stringify(providerDetail),
          },
          scaler:
            data.minInstances !== undefined || data.maxInstances !== undefined
              ? {
                  minInstances: data.minInstances,
                  maxInstances: data.maxInstances,
                }
              : undefined,
        },
      },
      (err) => {
        error = err.statusText || 'Failed to create deployment';
      },
    );
    if (!error) onSuccess();
  }}
/>
