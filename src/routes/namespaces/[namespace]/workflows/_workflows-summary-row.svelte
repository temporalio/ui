<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { namespace } from '$lib/stores/namespace';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import Time from '$lib/components/workflow-time.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  export let workflow: WorkflowExecution;
  export let timeFormat: string;

  $: href = getWorkflowExecutionUrl($namespace, workflow);
</script>

<article class="flex flex-row border-2 p-1">
  <div class="w-6/12 text-left">
    <a sveltekit:noscroll {href}>
      <h3>
        {workflow.name}
      </h3>
    </a>
  </div>
  <div class="w-3/12 text-left">
    <a sveltekit:noscroll {href}>
      {workflow.id}
    </a>
  </div>
  <div class="w-2/12 text-left">
    <a sveltekit:noscroll {href}>
      <div>
        <WorkflowStatus status={workflow.status} />
      </div>
    </a>
  </div>
  <div class="w-2/12 text-left">
    <a sveltekit:noscroll {href}>
      <Time time={workflow.startTime} {timeFormat} />
    </a>
  </div>
  <div class="w-3/12 text-left">
    <a sveltekit:noscroll {href}>
      <Time time={workflow.endTime} {timeFormat} />
    </a>
  </div>
</article>

<style lang="postcss">
  a {
    @apply w-full h-full flex no-underline p-2;
  }
</style>
