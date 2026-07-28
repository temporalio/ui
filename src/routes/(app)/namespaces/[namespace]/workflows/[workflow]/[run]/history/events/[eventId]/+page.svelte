<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryEvent from '$lib/pages/workflow-history-event.svelte';

  let { params }: PageProps = $props();
</script>

<PageTitle
  title={`${translate(
    'workflows.workflow-history',
  )} | ${params.workflow} | Event ${params.eventId}`}
  url={page.url.href}
/>
<WorkflowHistoryEvent
  eventId={params.eventId}
  namespace={params.namespace}
  workflowId={params.workflow}
  runId={params.run}
/>
