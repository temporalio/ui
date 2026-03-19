<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import ServerlessWorkerDetail from '$lib/pages/serverless-worker-detail.svelte';

  const namespace = $derived(page.params.namespace);
  const id = $derived(page.params.id);
</script>

<PageTitle
  title={translate('workers.serverless-detail-title')}
  url={page.url.href}
/>

<ServerlessWorkerDetail {id} {namespace} />
