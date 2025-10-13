<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import WorkflowHistoryComparisonLayout from '$lib/layouts/workflow-history-comparison-layout.svelte';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    workflowId: string;
    runId: string;
    resetFromEventId: string;
    index: number;
  }

  let { namespace, workflowId, runId, index }: Props = $props();

  const workflowUrl = $derived(
    routeForEventHistory({
      namespace,
      workflow: workflowId,
      run: runId,
    }),
  );
</script>

<div class="comparison-panel border-r border-subtle bg-primary">
  <div class="panel-header z-10 border-b border-subtle bg-primary p-3">
    <div class="flex items-center justify-between">
      <div class="flex flex-1 justify-between">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">Reset #{index + 1}</h3>
        </div>
        <div class="mt-1 flex items-center gap-2 text-xs text-secondary">
          <Link href={workflowUrl} target="_blank" class="truncate text-xs"
            >{runId}</Link
          >
        </div>
      </div>
    </div>
  </div>
  <div class="panel-content overflow-auto">
    <WorkflowHistoryComparisonLayout {namespace} {workflowId} {runId} />
  </div>
</div>

<style lang="postcss">
  .comparison-panel {
    @apply flex flex-col;

    min-width: 600px;
  }

  .panel-header {
    @apply border-b border-subtle;
  }

  .panel-content {
    @apply flex-1 overflow-auto;
  }
</style>
