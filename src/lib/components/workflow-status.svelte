<script lang="ts">
  import HeartBeat from './heart-beat-indicator.svelte';

  export let status: WorkflowExecutionStatus;
  export let delay: number;

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
    Running: 'blue',
    TimedOut: 'red',
    Completed: 'green',
    Failed: 'red',
    ContinuedAsNew: 'indigo',
    Canceled: 'yellow',
    Terminated: 'pink',
  };

  $: color = colors[status];
  $: label = humanFriendlyNames[status];
  $: isRunning = label === humanFriendlyNames.Running;
</script>

<span class={`status flex text-center font-medium leading-4`}>
  <h6 class={`${color} flex rounded-sm z-10 px-1`}>
    {label}
    {#if isRunning}
      <HeartBeat {delay} />
    {/if}
  </h6>
</span>

<style lang="postcss">
  .status {
    font-size: 12px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
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
