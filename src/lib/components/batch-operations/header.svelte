<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { autoRefresh } from '$lib/stores/batch-operations';
  import type { BatchOperation } from '$lib/types/batch';

  import BatchOperationStatusBadge from './batch-operation-status-badge.svelte';

  interface Props {
    operation: BatchOperation;
    onToggleAutoRefresh?: (checked: boolean) => void;
  }

  let { operation, onToggleAutoRefresh }: Props = $props();

  const handleToggleAutoRefresh = (event: Event) => {
    if (!(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }

    const { checked } = event.currentTarget;
    $autoRefresh = checked;
    onToggleAutoRefresh?.(checked);
  };
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2 max-sm:flex-col">
      <h1>
        {translate('batch.describe-page-title')}
      </h1>
      <BatchOperationStatusBadge
        state={operation.state}
        class="h-8 px-4 text-lg"
      />
    </div>
    <Copyable
      content={operation.jobId}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
    />
  </div>
  {#if operation.state === 'Running'}
    <Tooltip
      top
      text={translate('common.auto-refresh-tooltip', { interval: '5' })}
    >
      <ToggleSwitch
        id="batch-operation-auto-refresh"
        label={translate('common.auto-refresh')}
        labelPosition="left"
        checked={$autoRefresh}
        onchange={handleToggleAutoRefresh}
      />
    </Tooltip>
  {/if}
</div>
