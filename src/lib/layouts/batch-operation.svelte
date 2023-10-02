<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';
</script>

{#if $inProgressBatchOperation}
  <Alert
    icon="info"
    intent="info"
    title={translate('batch', 'max-concurrent-alert-title')}
  >
    {translate('batch', 'max-concurrent-alert-description')}
  </Alert>
{/if}
