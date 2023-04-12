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
</script>

<div class="flex flex-col gap-2">
  <h1 class="flex gap-1 items-center text-xl">At-a-glance</h1>
  <div class="grid grid-cols-5 gap-2">
    <Card
      class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end text-right"
    >
      <h3 class="text-purple-300 text-base">{workflow.id}</h3>
      <p>Execution Id</p>
    </Card>
    <Card
      class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end text-right"
    >
      <h3 class="text-purple-300 text-base">{workflow.runId}</h3>
      <p>Run Id</p>
    </Card>

    <Card
      class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end text-right"
    >
      <h3 class="text-purple-300 text-4xl">{workers.pollers.length}</h3>
      <p>Workers</p>
    </Card>
    <Card
      class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end text-right"
    >
      <h3 class="text-purple-300 text-xl">{workflow?.taskQueue}</h3>
      <p>Task Queue</p>
    </Card>
    <Card
      class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end text-right"
    >
      <h3 class="text-purple-300 text-4xl">{workflow?.stateTransitionCount}</h3>
      <p>State Transitions</p>
    </Card>
  </div>
  <div class="grid grid-cols-5 gap-2">
    <Card
      class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end text-right"
    >
      <h3 class="text-purple-300 text-xl">
        {formatDate(workflow?.startTime, $timeFormat)}
      </h3>
      <p>Start Time</p>
    </Card>
    {#if !workflow?.isRunning}
      <Card
        class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end text-right"
      >
        <h3 class="text-purple-300 text-xl">
          {formatDate(workflow?.endTime, $timeFormat)}
        </h3>
        <p>Close Time</p>
      </Card>
      <Card
        class="bg-gray-900 text-white flex flex-col gap-0 justify-end items-end"
      >
        <h3 class="text-purple-300 text-xl">
          {formatDistanceAbbreviated({
            start: workflow?.startTime,
            end: workflow?.endTime,
          })}
        </h3>
        <p>Duration</p>
      </Card>
    {/if}
  </div>
</div>
