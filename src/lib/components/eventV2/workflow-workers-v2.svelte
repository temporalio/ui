<script lang="ts">
  import { page } from '$app/stores';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { workflowRun } from '$lib/stores/workflow-run';

  import Accordion from '$lib/holocene/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import ChildWorkflowsTable from '$lib/components/workflow/child-workflows-table.svelte';
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import WorkersList from '$lib/components/workers-list.svelte';
  import WorkersListV2 from './workers-list-v2.svelte';

  export let taskQueue: string;

  $: ({ workers, workflow } = $workflowRun);
</script>

<section>
  <Accordion title="Workers">
    <div slot="summary" class="flex gap-2">
      <Badge type="green">{workers?.pollers?.length}</Badge>
      <Badge type="alpha">{taskQueue}</Badge>
    </div>
    <WorkersListV2 taskQueue={workflow.taskQueue} {workers} />
  </Accordion>
</section>
