<script>var _a;
import EmptyState from '../../holocene/empty-state.svelte';
export let workflow;
export let workers;
$: runningWithNoWorkers = workflow.isRunning && !((_a = workers === null || workers === void 0 ? void 0 : workers.pollers) === null || _a === void 0 ? void 0 : _a.length);
</script>

{#if runningWithNoWorkers}
  <section class="stack-trace">
    <EmptyState
      icon="warning"
      title="No Workers Running"
      content="Please make sure you have at least one worker connected to the {workflow.taskQueue} Task Queue."
      class="my-0"
    />
  </section>
{/if}

<style>
  .stack-trace {
    position: relative;
    display: flex;
    width: 100%;
    flex-direction: column;
    border-radius: 0.5rem;
    border-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(161 98 7 / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: rgb(254 252 232 / var(--tw-bg-opacity));
    padding: 1rem;
    --tw-text-opacity: 1;
    color: rgb(113 63 18 / var(--tw-text-opacity))
}</style>
