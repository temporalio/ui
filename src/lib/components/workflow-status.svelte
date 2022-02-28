<script lang="ts">
  export let status: WorkflowExecutionStatus;

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
</script>

<span class={`${color} rounded-md text-center px-2 text-sm`}>
  {label}
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
