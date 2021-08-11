<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: TimerStartedEvent;
</script>

 <KeyValueTable data={event.timerStartedEventAttributes} />

