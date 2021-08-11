<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: TimerCanceledEvent;
</script>

 <KeyValueTable data={event.timerCanceledEventAttributes} />

