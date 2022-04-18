<script lang="ts">
  import FailedIndicator from './Loading/failed-indicator.svelte';

  import LoadingIndicator from './Loading/loading-indicator.svelte';

  export let status: WorkflowExecutionStatus;

  let isRunning: Boolean = status === 'Running';
  let hasFailed: Boolean = status === 'Failed';

  const humanFriendlyNames = {
    Running: 'Running',
    TimedOut: 'Timed Out',
    Completed: 'Completed',
    Failed: 'Failed',
    ContinuedAsNew: 'Continued as New',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };

  const colors = {
    Running: 'white',
    TimedOut: 'red',
    Completed: 'green',
    Failed: 'red',
    ContinuedAsNew: 'indigo',
    Canceled: 'yellow',
    Terminated: 'pink',
  };

  $: color = colors[status];
  $: label = humanFriendlyNames[status];
</script>

<span class={`flex rounded-md text-center text-sm`}>
  <span class={`${color} text-sm z-10 px-2 `}>{label}</span>
  {#if isRunning}
    <LoadingIndicator />
  {/if}
  {#if hasFailed}
    <FailedIndicator />
  {/if}
</span>

<style lang="postcss">
  .green {
    @apply bg-green-100 text-green-700;
  }
  .yellow {
    @apply bg-yellow-100 text-yellow-900;
  }
  .blue {
    @apply bg-blue-100 text-blue-700;
  }
  .red {
    @apply bg-red-100 text-red-700;
  }
  .indigo {
    @apply bg-indigo-100 text-indigo-700;
  }
  .purple {
    @apply bg-purple-100 text-purple-700;
  }
  .pink {
    @apply bg-pink-100 text-pink-700;
  }
</style>
