<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: TimerStartedEvent;
</script>

<KeyValueTable data={event.timerStartedEventAttributes} />
