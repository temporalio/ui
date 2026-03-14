<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkersLayout from '$lib/layouts/workers-layout.svelte';
  import WorkerDeployments from '$lib/pages/deployments.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title={translate('deployments.worker-deployments')}
  url={page.url.href}
/>
<WorkersLayout {namespace}>
  <WorkerDeployments />
</WorkersLayout>
