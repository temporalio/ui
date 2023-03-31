<script lang="ts">
  import EventSummaryV2 from '$lib/components/eventV2/event-summary-v2.svelte';
  import WorkflowRelationshipsV2 from '$lib/components/eventV2/workflow-relationships-v2.svelte';
  import WorkflowSummaryV2 from '$lib/components/eventV2/workflow-summary-v2.svelte';
  import { eventHistory } from '$lib/stores/events';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import WorkflowWorkersV2 from '$lib/components/eventV2/workflow-workers-v2.svelte';
  import WorkflowStackTraceV2 from '$lib/components/eventV2/workflow-stack-trace-v2.svelte';
  import WorkflowQueryV2 from '$lib/components/eventV2/workflow-query-v2.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { page } from '$app/stores';
  import WorkflowOptionsV2 from '$lib/components/eventV2/workflow-options-v2.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { isCompletionEvent } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { authUser } from '$lib/stores/auth-user';
  import { fetchAllEvents } from '$lib/services/events-service';
  import Accordion from '$lib/holocene/accordion.svelte';
  import { onDestroy } from 'svelte';
  import { getWorkflowEnhancedStackTrace } from '$lib/services/query-service';
  import { timeTravelEnhancedStackTrace } from './mocks/stack-traces';
  import RangeInput from '$lib/holocene/input/range-input.svelte';
  import EnhancedStackTraceView from './enhanced-stack-trace-view.svelte';
  import FunSlider from '$lib/holocene/input/fun-slider.svelte';

  let controller;
  let maxTimeTravel = 1;
  let timeTravelPosition = 1;

  $: maxTimeTravel, (timeTravelPosition = maxTimeTravel);

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $eventHistory,
    fullHistory,
  );

  let fetchHistory: Promise<CommonHistoryEvent[]>;
  let fullHistory: CommonHistoryEvent[] = [];
  let showNonCompleted = false;
  let showWorkflowTasks = false;
  let showStackTrace = false;
  let stacks = {};

  const onUpdate = async ({ history }) => {
    const { settings } = $page.data;
    fullHistory = await toEventHistory({
      response: history.events,
      namespace,
      settings,
      accessToken: $authUser?.accessToken,
    });
    const lastEvent = fullHistory[fullHistory.length - 1];
    if (isCompletionEvent(lastEvent)) {
      $refresh = Date.now();
    }
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    controller = new AbortController();
    const signal = controller.signal;
    const { settings } = $page.data;
    fetchHistory = fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      params: { waitNewEvent: 'true' },
      accessToken: $authUser?.accessToken,
      sort: 'ascending',
      onUpdate,
      signal,
    });
  };

  const getSnippet = (line: number, sourceText: string): [string, number] => {
    const sliceSize = 10;
    const snippetBeginning = Math.max(0, line - Math.floor(sliceSize / 2));
    const snippetEnd = Math.min(
      sourceText.length,
      Math.max(10, line + Math.floor(sliceSize / 2)),
    );
    const sourceSlice = sourceText
      .split('\n')
      .slice(snippetBeginning, snippetEnd)
      .join('\n');
    const lineInSlice =
      line <= Math.floor(sliceSize / 2) ? line : line - snippetBeginning;
    return [sourceSlice, lineInSlice];
  };

  const getStacks = (stackTrace) => {
    const { sources, stacks } = stackTrace;
    let stackContent = [];
    Object.entries(stacks).map(([key, traces]) => {
      const stackTraces = [];
      traces.forEach((trace) => {
        const location = trace.locations.reverse()[0];
        const eventIds = trace.correlatingEventIds;
        const source = sources[location.filePath][0]?.content;
        const { line, column, functionName, filePath } = location;
        const snippet = getSnippet(line, source);
        stackTraces.push({
          eventIds,
          source,
          snippet,
          line,
          column,
          functionName,
          filePath,
        });
        stacks[key] = stackTraces;
      });
      if (!traces.length) delete stacks[key];
    });
    return stacks;
  };

  const fetchStackTrace = async () => {
    const { settings } = $page.data;
    stacks = getStacks(timeTravelEnhancedStackTrace);
    maxTimeTravel = Object.keys(stacks).length;
    // stackTrace = await getWorkflowEnhancedStackTrace(
    //   { namespace, workflow },
    //   settings,
    //   $authUser?.accessToken,
    // );
  };

  $: fetchEvents(namespace, workflowId, runId);
  $: {
    if (showStackTrace) {
      fetchStackTrace();
    }
  }

  onDestroy(() => {
    controller.abort();
    console.log('Polling events aborted');
  });
</script>

<PageTitle
  title={`Workflow History | ${workflow.runId}`}
  url={$page.url.href}
/>
{#if showStackTrace}
  <div
    class="flex flex-col gap-2 xl:flex-row-reverse bg-white rounded-xl border-2 p-4"
  >
    <div class="w-full">
      <FunSlider
        id="time-travel-range"
        min={1}
        max={maxTimeTravel}
        bind:value={timeTravelPosition}
        showInput={false}
      />
      <EnhancedStackTraceView
        {fullHistory}
        {showNonCompleted}
        {showWorkflowTasks}
        {stacks}
        {timeTravelPosition}
      />
    </div>
  </div>
{:else}
  <div class="flex flex-col gap-2 xl:flex-row-reverse">
    <div class="flex w-full flex-col gap-2 xl:w-[40%]">
      <WorkflowOptionsV2
        {showWorkflowTasks}
        {showNonCompleted}
        {showStackTrace}
        onDebugClick={() => (showNonCompleted = !showNonCompleted)}
        onShowStackTrace={() => (showStackTrace = !showStackTrace)}
        onAdvancedClick={() => (showWorkflowTasks = !showWorkflowTasks)}
      />
      <WorkflowSummaryV2 />
      <WorkflowRelationshipsV2 {...workflowRelationships} />
      <WorkflowWorkersV2 taskQueue={workflow.taskQueue} />
      <WorkflowStackTraceV2 />
      <Accordion title="Query" let:open>
        {#if open}
          <WorkflowQueryV2 />
        {/if}
      </Accordion>
    </div>
    <div class="w-full xl:w-[60%]">
      <EventSummaryV2
        {fullHistory}
        {showNonCompleted}
        {showWorkflowTasks}
        {showStackTrace}
        {timeTravelPosition}
      />
    </div>
  </div>
{/if}
