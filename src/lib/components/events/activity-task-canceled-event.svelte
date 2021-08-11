<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: ActivityTaskCanceledEvent;
</script>

<KeyValueTable data={event.activityTaskCanceledEventAttributes} />
