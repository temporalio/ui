<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import WorkflowSimpleHistory from '$lib/layouts/workflow-simple-history.svelte';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    workflowId: string;
    runId: string;
    resetFromEventId?: string;
    index: number;
  }

  let { namespace, workflowId, runId, resetFromEventId, index }: Props =
    $props();

  const workflowUrl = $derived(
    routeForEventHistory({
      namespace,
      workflow: workflowId,
      run: runId,
    }),
  );
</script>

<div class="flex w-full flex-col border-r border-subtle">
  <div class="z-10 p-3">
    <div class="flex items-center justify-between">
      <div class="flex flex-1 justify-between">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">
            {resetFromEventId ? `Reset ${index + 1}` : 'Original'}
          </h3>
        </div>
        <div class="mt-1 flex items-center gap-2 text-xs text-secondary">
          <Link href={workflowUrl} target="_blank" class="truncate text-xs"
            >{runId}</Link
          >
        </div>
      </div>
    </div>
  </div>
  <div class="flex-1 overflow-auto">
    <WorkflowSimpleHistory {namespace} {workflowId} {runId} />
  </div>
</div>
