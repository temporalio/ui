<script>
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';

  export let loading = true;
  export let errorMessage = '';
  export let error = '';
</script>

<TableRow>
  <td class="hidden xl:table-cell" />
  <td colspan="3">
    {#if loading}
      <Loading />
    {:else}
      <EmptyState title="No Workflows Found" content={errorMessage} {error} />
    {/if}
  </td>
  <td class="hidden xl:table-cell" />
</TableRow>
