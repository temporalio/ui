<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ActivityTaskScheduledEvent;
</script>

<KeyValueTable data={event.activityTaskScheduledEventAttributes} />
