<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';

  import BatchOperationsTable from './_batch-operations-table.svelte';

  $: namespace = $page.params.namespace;
  $: operations = $page.data.batchOperations.operations;
</script>

<PageTitle title="Batch Operations" />
<h1 class="text-2xl">Batch Operations</h1>
<BatchOperationsTable {operations} {namespace} />
