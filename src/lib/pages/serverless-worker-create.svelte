<script lang="ts">
  import ServerlessWorkerCreateForm from '$lib/components/workers/serverless-worker-form/serverless-worker-create-form.svelte';
  import { translate } from '$lib/i18n/translate';
  import { createServerlessWorker } from '$lib/services/serverless-worker-service';
  import { routeForWorkers } from '$lib/utilities/route-for';

  type Props = {
    namespace: string;
    onSuccess: () => void;
  };

  let { namespace, onSuccess }: Props = $props();
</script>

<ServerlessWorkerCreateForm
  {namespace}
  submitButtonText={translate('workers.create-serverless-worker')}
  cancelHref={routeForWorkers({ namespace })}
  onSubmit={(data) => {
    createServerlessWorker(data);
    onSuccess();
  }}
/>
