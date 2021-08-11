<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ActivityTaskTimedOutEvent;
</script>

<KeyValueTable data={event.activityTaskTimedOutEventAttributes} />
