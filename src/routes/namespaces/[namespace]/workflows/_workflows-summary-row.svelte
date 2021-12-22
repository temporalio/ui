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

<a sveltekit:noscroll {href}>
  <article class="row flex flex-row border-b-2">
    <div class="links w-3/12 text-left">
      {workflow.id}
    </div>
    <div class="links w-3/12 text-left">
      <h3>
        {workflow.name}
      </h3>
    </div>
    <div class="w-3/12 text-left">
      <div>
        <WorkflowStatus status={workflow.status} />
      </div>
    </div>
    <div class="w-2/12 text-left">
      <Time time={workflow.startTime} {timeFormat} />
    </div>
    <div class="w-2/12 text-left">
      <Time time={workflow.endTime} {timeFormat} />
    </div>
  </article>
</a>

<style lang="postcss">
  .row {
    @apply w-full h-full flex no-underline p-2;
  }

  .row:hover {
    @apply bg-green-100;
  }

  .row:hover .links {
    @apply underline text-blue-500;
  }
</style>
