<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import SessionViewPage from '$lib/pages/session-view.svelte';

  $: namespace = $page.params.namespace;
  $: workflowId = $page.url.searchParams.get('workflowId') ?? '';
</script>

<PageTitle title="Session View" />
<SessionViewPage {namespace} {workflowId} />
