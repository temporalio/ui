<script lang="ts">
  let { groupRow = false }: { groupRow?: boolean } = $props();
</script>

<div data-testid="event-details-full" data-group-row={groupRow}></div>
