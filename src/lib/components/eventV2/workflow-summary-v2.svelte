<script lang="ts">
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    workflowRun,
    workflowSummaryViewOpen,
  } from '$lib/stores/workflow-run';
  import { routeForWorkers } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';

  import Accordion from '$lib/holocene/accordion.svelte';
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  $: ({ workflow, workers } = $workflowRun);

  export let hasChildren: boolean;
  export let children: ChildWorkflowExecutionCompletedEvent[];
  export let hasPendingChildren: boolean;
  export let hasRelationships: boolean;
  export let first: string;
  export let parent: WorkflowIdentifier;
  export let next: string;
  export let previous: string;
</script>

<div class="flex flex-col gap-2">
  <h1 class="flex gap-1 items-center text-xl">At-a-glance</h1>
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
    <Card class="flex flex-col gap-0 text-right">
      <p>Workers</p>
      <h3 class="font-bold">{workers.pollers.length}</h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>Latency</p>
      <h3 class="font-bold">12 kb/s</h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>Children</p>
      <h3 class="font-bold">
        {workflow?.pendingChildren.length + children.length}
      </h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>Metric</p>
      <h3 class="font-bold">X</h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>Size</p>
      <h3 class="font-bold">{Math.round(parseInt(workflow.size) / 1000)} kb</h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>State Transitions</p>
      <h3 class="font-bold">{workflow?.stateTransitionCount}</h3>
    </Card>
  </div>
</div>
