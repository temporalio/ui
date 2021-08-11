<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ActivityTaskCompletedEvent;
</script>

 <KeyValueTable data={event.activityTaskCompletedEventAttributes} />

