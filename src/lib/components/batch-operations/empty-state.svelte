<script lang="ts">
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconBatchOperation } from '$lib/io/icon';
</script>

<ResourceEmptyState
  title={translate('batch.empty-state-title')}
  content={translate('batch.empty-state-description')}
  Icon={IconBatchOperation}
  testId="batch-operations-empty-state"
  placeholder
></ResourceEmptyState>
