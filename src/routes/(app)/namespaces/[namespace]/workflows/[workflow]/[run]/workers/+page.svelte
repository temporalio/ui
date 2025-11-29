<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  let { params }: PageProps = $props();
  const { workflow: workflowId } = $derived(params);
  const { workers, workflow } = $derived($workflowRun);
</script>

<PageTitle
  title={`${translate('workflows.workers-tab')} | ${workflowId}`}
  url={page.url.href}
/>
<WorkflowWorkers {workers} taskQueue={workflow?.taskQueue} {...params} />
