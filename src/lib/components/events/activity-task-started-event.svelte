<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ActivityTaskStartedEvent;
</script>

 <KeyValueTable data={event.activityTaskStartedEventAttributes} />

