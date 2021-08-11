<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ActivityTaskCancelRequestedEvent;
</script>

 <KeyValueTable data={event.activityTaskCancelRequestedEventAttributes} />

