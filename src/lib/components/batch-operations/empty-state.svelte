<script lang="ts">
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconBatchOperation } from '$lib/io/icon';
</script>

<ResourceEmptyState
  title={translate('batch.empty-state-title')}
  Icon={IconBatchOperation}
  testId="batch-operations-empty-state"
  placeholder
>
  {#snippet description()}
    <p>{translate('batch.empty-state-description')}</p>
    <p>
      {translate('batch.empty-state-read-docs-prefix')}
      <Link href="https://docs.temporal.io/cli/command-reference/batch" newTab>
        {translate('batch.empty-state-docs-link')}
      </Link>
      {translate('batch.empty-state-read-docs-suffix')}
    </p>
  {/snippet}
</ResourceEmptyState>
