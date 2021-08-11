<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ActivityTaskFailedEvent;
</script>

 <KeyValueTable data={event.activityTaskFailedEventAttributes} />

