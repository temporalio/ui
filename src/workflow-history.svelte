<script lang="ts">
  import { setContext } from 'svelte';

  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import { toWorkflowExecution } from '$lib/models/workflow-execution';
  // v2.54.1 overlay target. Absent from fork v2.52 `src/` (uses fullEventHistory stores).
  import {
    ingestHistoryEvent,
    reset,
    setPendingMetadata,
  } from '$lib/services/grouped-event-buffer';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { HistoryEvent } from '$lib/types/events';
  import type { TaskQueueResponse } from '$lib/types';
  import type { WorkflowExecutionAPIResponse } from '$lib/types/workflows';

  import { ensureI18n } from './ensure-i18n';
  import './workflow-history.css';

  type Props = {
    /** Temporal GetWorkflowExecution / describe-execution API body. */
    execution: WorkflowExecutionAPIResponse;
    /** Raw history events (ingest converts via Upstream `toWorkflowEvent`). */
    history: HistoryEvent[];
    namespace: string;
    /** Optional DescribeTaskQueue / pollers snapshot. Omit → Upstream defaults (Q6 B). */
    workers?: TaskQueueResponse;
  };

  let { execution, history, namespace, workers }: Props = $props();

  const workflow = $derived.by(() => {
    const model = toWorkflowExecution(execution);
    Object.defineProperty(model, 'canBeTerminated', {
      value: false,
      configurable: true,
    });
    return model;
  });

  const latestEventId = $derived(
    history.reduce((max, event) => Math.max(max, parseInt(event.eventId)), 0),
  );

  setContext<HistoryContext>(HISTORY_CTX, {
    fetchComplete: true,
    get latestEventId() {
      return latestEventId;
    },
    get totalExpectedEvents() {
      return history.length;
    },
    descMinId: 1,
    resume() {},
  });

  let bufferedRunId: string | undefined;

  // Sync Host props into Upstream stores/buffer (external module state — not component $state).
  $effect.pre(() => {
    workflowRun.update((run) => {
      if (workers !== undefined) {
        return {
          ...run,
          workflow,
          workers,
          workersLoaded: true,
        };
      }
      return { ...run, workflow };
    });

    setPendingMetadata(
      workflow.pendingActivities ?? [],
      workflow.pendingNexusOperations ?? [],
    );
  });

  $effect.pre(() => {
    if (bufferedRunId !== workflow.runId) {
      reset(history.length);
      bufferedRunId = workflow.runId;
    }
    for (const event of history) ingestHistoryEvent(event);
  });
</script>

{#await ensureI18n() then}
  <div
    class="temporal-ui"
    data-forkbomb="workflow-history"
    data-namespace={namespace}
  >
    <WorkflowHistoryLayout />
  </div>
{/await}

<style>
  /* Prefer CSS-only link disable — no Upstream patches. */
  :global(.temporal-ui a[href]) {
    pointer-events: none;
    cursor: default;
    text-decoration: none;
  }
</style>
