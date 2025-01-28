<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { autoRefresh } from '$lib/stores/batch-operations';
  import type { BatchOperation, BatchOperationState } from '$lib/types/batch';

  export let operation: BatchOperation;

  const dispatch = createEventDispatcher<{
    toggleAutoRefresh: { checked: boolean };
  }>();

  const handleToggleAutoRefresh = (
    event: Event & { target: EventTarget & HTMLInputElement },
  ) => {
    const { checked } = event.target;
    dispatch('toggleAutoRefresh', { checked });
    $autoRefresh = checked;
  };

  const jobStateToBadgeType: Record<BatchOperationState, BadgeType> = {
    Completed: 'success',
    Running: 'primary',
    Failed: 'danger',
    Unspecified: undefined,
  };
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2 max-sm:flex-col">
      <h1>
        {translate('batch.describe-page-title')}
      </h1>
      <Badge type={jobStateToBadgeType[operation.state]}>
        {operation.state}
      </Badge>
    </div>
    <p>
      {operation.jobId}
    </p>
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
