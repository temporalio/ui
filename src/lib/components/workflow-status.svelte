<script lang="ts">
  import type { WorkflowExecutionStatus } from '$types/temporal/api/enums/v1/workflow';
  export let status: WorkflowExecutionStatus;

  const humanFriendlyNames = {
    Running: 'Running',
    TimedOut: 'Timed',
    Completed: 'Completed',
    Failed: 'Failed',
    ContinuedAsNew: 'Continued',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };

  const colors = {
    Running: 'green',
    TimedOut: 'yellow',
    Completed: 'blue',
    Failed: 'red',
    ContinuedAsNew: 'indigo',
    Canceled: 'purple',
    Terminated: 'pink',
  };

  $: color = colors[status];
  $: label = humanFriendlyNames[status];
</script>

<span class={`${color} rounded-xl text-center px-2 text-sm`}>
  {label}
</span>

<style lang="postcss">
  .green {
    @apply bg-green-200 text-green-600;
  }
  .yellow {
    @apply bg-yellow-200 text-yellow-600;
  }
  .blue {
    @apply bg-blue-200 text-blue-600;
  }
  .red {
    @apply bg-red-200 text-red-600;
  }
  .indigo {
    @apply bg-indigo-200 text-indigo-600;
  }
  .purple {
    @apply bg-purple-200 text-purple-600;
  }
  .pink {
    @apply bg-pink-200 text-pink-600;
  }
</style>
