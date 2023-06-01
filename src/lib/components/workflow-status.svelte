<script lang="ts">
  import HeartBeat from './heart-beat-indicator.svelte';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { translate } from '$lib/i18n/translate';
  import type { EventClassification } from '$lib/types/events';

  type Status = WorkflowStatus | EventClassification | 'Paused';

  export let status: Status = 'Running';
  export let delay: number = 0;

  const humanFriendlyNames: Partial<Record<Status, string>> = {
    Running: translate('workflows', 'running'),
    TimedOut: translate('workflows', 'timed-out'),
    Completed: translate('workflows', 'completed'),
    Failed: translate('workflows', 'failed'),
    ContinuedAsNew: translate('workflows', 'continued-as-new'),
    Canceled: translate('workflows', 'canceled'),
    Terminated: translate('workflows', 'terminated'),
    Paused: translate('workflows', 'paused'),
  };

  const colors = {
    Running: 'blue',
    TimedOut: 'orange',
    Completed: 'green',
    Failed: 'red',
    ContinuedAsNew: 'purple',
    Canceled: 'yellow',
    Terminated: 'gray',
    Paused: 'yellow',
  };

  $: color = colors[status];
  $: label = humanFriendlyNames[status];
  $: isRunning = label === humanFriendlyNames.Running;
</script>

<span class="flex text-center text-sm font-medium leading-4">
  <h6 class="{color} flex rounded-sm px-1 py-1">
    <span class="whitespace-nowrap">{label}</span>
    {#if isRunning}
      <HeartBeat {delay} />
    {/if}
  </h6>
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

  .purple {
    @apply bg-purple-100 text-purple-900;
  }

  .gray {
    @apply bg-gray-200 text-gray-900;
  }

  .orange {
    @apply bg-orange-100 text-orange-900;
  }
</style>
