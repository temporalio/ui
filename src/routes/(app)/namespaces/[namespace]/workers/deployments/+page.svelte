<script lang="ts">
  import { page } from '$app/state';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkersLayout from '$lib/layouts/workers-layout.svelte';
  import WorkerDeployments from '$lib/pages/deployments.svelte';
  import { routeForWorkerDeploymentCreate } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const createHref = $derived(routeForWorkerDeploymentCreate({ namespace }));
</script>

<PageTitle
  title={translate('deployments.worker-deployments')}
  url={page.url.href}
/>
<WorkersLayout {namespace}>
  {#snippet headerAction()}
    <CapabilityGuard capability="serverlessWorkers">
      <Button variant="primary" href={createHref}>
        {translate('workers.create-serverless-worker')}
      </Button>
    </CapabilityGuard>
  {/snippet}
  <WorkerDeployments />
</WorkersLayout>
