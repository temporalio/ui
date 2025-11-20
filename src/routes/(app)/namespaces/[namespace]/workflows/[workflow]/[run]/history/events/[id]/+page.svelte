<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryEvent from '$lib/pages/workflow-history-event.svelte';

  let { params }: PageProps = $props();
  const { id, workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate(
    'workflows.workflow-history',
  )} | ${workflow} | Event ${id}`}
  url={page.url.href}
/>
<WorkflowHistoryEvent {...params} />
