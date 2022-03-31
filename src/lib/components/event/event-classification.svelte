<script lang="ts">
  export let event: IterableEvent;
</script>

<span class="label">
  {event.name}
</span>

<style lang="postcss">
  .label {
    @apply font-medium font-normal;
  }

  /* .Open,
  .New {
    @apply text-indigo-700 bg-indigo-100;
  }

  .Started,
  .Initiated {
    @apply text-blue-700 bg-blue-100;
  }

  .Running,
  .Completed,
  .Fired {
    @apply text-green-700 bg-green-100;
  }

  .CancelRequested,
  .TimedOut,
  .Signaled,
  .Cancelled {
    @apply text-yellow-700 bg-yellow-100;
  }

  .Failed,
  .Terminated {
    @apply text-red-700 bg-red-100;
  } */
</style>
