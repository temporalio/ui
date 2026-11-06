<script lang="ts">
  import { untrack } from 'svelte';

  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { materializeGroup } from '$lib/services/grouped-event-buffer';
  import type { ExecutionHistory } from '$lib/services/grouped-event-buffer.svelte';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import TimelineGraph from './timeline-graph.svelte';

  interface Props {
    namespace: string;
    workflowId?: string | null;
    runId?: string | null;
    eventCount?: number;
    viewportHeight?: number;
    onLoad?: () => void;
    class?: string;
  }

  let {
    namespace,
    workflowId,
    runId = '',
    eventCount = 0,
    viewportHeight = 360,
    onLoad = () => {},
    class: className = '',
  }: Props = $props();

  let snapshot = $state<{
    workflow: WorkflowExecution;
    groups: EventGroups;
    history: ExecutionHistory;
    namespace: string;
  }>();

  const getWorkflowAndEventHistory = async () => {
    if (!workflowId || !runId) return;

    const executionNamespace = namespace;
    const [{ workflow }, history] = await Promise.all([
      fetchWorkflow({ namespace, workflowId, runId }),
      fetchAllEvents({ namespace, workflowId, runId }),
    ]);
    if (!workflow) return;

    const pendingActivities = workflow?.pendingActivities ?? [];
    return {
      namespace: executionNamespace,
      workflow,
      groups: groupEvents(history, 'ascending', pendingActivities),
      history: {
        events: history,
        materializeGroup,
      },
    };
  };

  const fetchKey = $derived(
    `${namespace}|${workflowId}|${runId}|${eventCount}`,
  );

  $effect(() => {
    void fetchKey;
    let cancelled = false;
    untrack(() => getWorkflowAndEventHistory()).then((next) => {
      if (cancelled) return;
      snapshot = next;
      onLoad();
    });
    return () => {
      cancelled = true;
    };
  });
</script>

{#if snapshot}
  <!-- Bounded scroll box for the child-workflow mini-timeline; the graph
       virtualizes against this scroll parent (our TimelineGraph takes no
       viewportHeight prop). -->
  <div
    class="cursor-pointer overflow-auto {className}"
    style:max-height="{viewportHeight}px"
  >
    {#key JSON.stringify( [snapshot.namespace, snapshot.workflow.id, snapshot.workflow.runId], )}
      <TimelineGraph
        namespace={snapshot.namespace}
        workflow={snapshot.workflow}
        history={snapshot.history}
        lazyGroups={snapshot.groups}
        readOnly
      />
    {/key}
  </div>
{/if}
