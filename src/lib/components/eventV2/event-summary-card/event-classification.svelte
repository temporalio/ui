<script lang="ts">
  export let classification: EventClassification | string = 'Running';

  const humanFriendlyNames = {
    Running: 'Running',
    TimedOut: 'Timed Out',
    Completed: 'Completed',
    Failed: 'Failed',
    ContinuedAsNew: "Cont'd as New",
    Canceled: 'Canceled',
    Terminated: 'Terminated',
    Paused: 'Paused',
    Fired: 'Fired',
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
    Fired: 'gray',
  };

  $: color = colors[classification] ?? 'gray';
  $: label = humanFriendlyNames[classification] ?? classification;
</script>

<span class="flex text-center text-[12px] font-medium leading-4">
  <h6 class="{color} z-10 flex rounded-sm px-1 py-1">
    <span class="whitespace-nowrap">{label}</span>
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
