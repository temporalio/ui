<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeploymentVersionEdit from '$lib/pages/worker-deployment-version-edit.svelte';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deployment = $derived(page.params.deployment);
  const buildId = $derived(page.params.buildId);
  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );
</script>

<PageTitle
  title={translate('workers.edit-version-title')}
  url={page.url.href}
/>
<WorkerDeploymentVersionEdit
  {namespace}
  {deployment}
  {buildId}
  onSuccess={() => goto(backHref)}
/>
