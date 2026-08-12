<script lang="ts">
  import { untrack } from 'svelte';

  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import TimelineGraph from './timeline-graph.svelte';

  type TimelineSnapshot = {
    workflow: WorkflowExecution;
    groups: EventGroups;
  };

  interface Props {
    namespace?: string;
    workflowId?: string | null;
    runId?: string | null;
    eventCount?: number;
    viewportHeight?: number;
    snapshot?: TimelineSnapshot;
    readOnly?: boolean;
    onLoad?: () => void;
    class?: string;
  }

  let {
    namespace = '',
    workflowId,
    runId = '',
    eventCount = 0,
    viewportHeight = 360,
    snapshot,
    readOnly = true,
    onLoad = () => {},
    class: className = '',
  }: Props = $props();

  let fetchedSnapshot = $state<TimelineSnapshot>();
  let selectedGroup = $state<EventGroups[number]>();

  const resolvedSnapshot = $derived(snapshot ?? fetchedSnapshot);

  const getWorkflowAndEventHistory = async () => {
    if (!namespace || !workflowId || !runId) return;

    const [{ workflow }, history] = await Promise.all([
      fetchWorkflow({ namespace, workflowId, runId }),
      fetchAllEvents({ namespace, workflowId, runId }),
    ]);
    if (!workflow) return;

    const pendingActivities = workflow?.pendingActivities ?? [];
    return {
      workflow,
      groups: groupEvents(history, 'ascending', pendingActivities),
    };
  };

  const fetchKey = $derived(
    `${namespace}|${workflowId}|${runId}|${eventCount}`,
  );

  $effect(() => {
    void fetchKey;
    if (snapshot) return;
    let cancelled = false;
    untrack(() => getWorkflowAndEventHistory()).then((next) => {
      if (cancelled) return;
      fetchedSnapshot = next;
      onLoad();
    });
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    if (
      selectedGroup &&
      !resolvedSnapshot?.groups.some((group) => group.id === selectedGroup?.id)
    ) {
      selectedGroup = undefined;
    }
  });
</script>

{#if resolvedSnapshot}
  <!-- Bounded scroll box for the child-workflow mini-timeline; the graph
       virtualizes against this scroll parent (our TimelineGraph takes no
       viewportHeight prop). -->
  <div
    class="cursor-pointer overflow-auto {className}"
    style:max-height={selectedGroup && !readOnly
      ? 'none'
      : `${viewportHeight}px`}
  >
    <TimelineGraph
      workflow={resolvedSnapshot.workflow}
      groups={resolvedSnapshot.groups}
      {readOnly}
      embeddedSelection={!readOnly}
      bind:selectedGroup
    />
  </div>
{/if}
