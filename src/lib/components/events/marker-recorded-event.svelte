<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: MarkerRecordedEvent;
</script>

<KeyValueTable data={event.markerRecordedEventAttributes} />
