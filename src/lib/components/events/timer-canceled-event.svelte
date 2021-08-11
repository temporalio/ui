<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: TimerCanceledEvent;
</script>

<KeyValueTable data={event.timerCanceledEventAttributes} />
