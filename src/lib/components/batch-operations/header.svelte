<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { autoRefresh } from '$lib/stores/batch-operations';
  import type { BatchOperation, BatchOperationState } from '$lib/types/batch';

  export let operation: BatchOperation;

  const jobStateToBadgeType: Record<BatchOperationState, BadgeType> = {
    Completed: 'green',
    Running: 'blue',
    Failed: 'red',
    Unspecified: 'gray',
  };
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <h1 class="text-2xl">
        {translate('batch', 'describe-page-title')}
      </h1>
      <Badge type={jobStateToBadgeType[operation.state]}>
        {operation.state}
      </Badge>
    </div>
    <h2 class="text-sm">
      {operation.jobId}
    </h2>
  </div>
  {#if operation.state === 'Running'}
    <Tooltip top text={translate('auto-refresh-tooltip', { interval: '5' })}>
      <ToggleSwitch
        id="batch-operation-auto-refresh"
        label={translate('auto-refresh')}
        labelPosition="left"
        bind:checked={$autoRefresh}
      />
    </Tooltip>
  {/if}
</div>
