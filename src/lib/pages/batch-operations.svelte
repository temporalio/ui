<script lang="ts">
  import BatchOperationsTable from '$lib/components/batch-operations/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { BatchOperationInfo } from '$lib/types/batch';

  export let namespace: string;
  export let operations: BatchOperationInfo[];
</script>

<h1 class="text-2xl">{translate('batch', 'list-page-title')}</h1>
<BatchOperationsTable {operations} {namespace} />
