<script lang="ts">
  import BatchOperationsTable from '$lib/components/batch-operations/table.svelte';
  import { translate } from '$lib/i18n/translate';

  export let namespace: string;
</script>

<h1 class="text-2xl">{translate('batch', 'list-page-title')}</h1>
<BatchOperationsTable {namespace} />
