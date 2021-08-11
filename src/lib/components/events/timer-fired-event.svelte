<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: TimerFiredEvent;
</script>

<KeyValueTable data={event.timerFiredEventAttributes} />
