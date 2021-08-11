<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ActivityTaskTimedOutEvent;
</script>

 <KeyValueTable data={event.activityTaskTimedOutEventAttributes} />

