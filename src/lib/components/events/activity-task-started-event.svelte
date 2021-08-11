<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let event: ActivityTaskStartedEvent;
</script>

<KeyValueTable data={event.activityTaskStartedEventAttributes} />
