<script lang="ts">
  import KeyValueTable from '/components/key-value-table.svelte';

  export let event: UpsertWorkflowSearchAttributesEvent;
</script>

<KeyValueTable data={event.upsertWorkflowSearchAttributesEventAttributes} />
