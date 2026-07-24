<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/standalone-activities.svelte';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import type { PageSelectionStatus } from '$lib/utilities/batch-selection';

  import BatchActions from './batch-actions.svelte';

  type Props = {
    activities?: ActivityExecutionInfo[];
    empty?: boolean;
    columnsCount?: number;
    showBatchActions?: boolean;
    pageSelectionStatus?: PageSelectionStatus;
    onSelectPage?: (
      selected: boolean,
      activities: ActivityExecutionInfo[],
    ) => void;
    children?: Snippet;
  };

  let {
    activities = [],
    empty = false,
    columnsCount = 0,
    showBatchActions = false,
    pageSelectionStatus = 'unchecked',
    onSelectPage = () => {},
    children,
  }: Props = $props();

  const { batchActionsVisible } = getContext<ActivityBatchOperationContext>(
    ACTIVITY_BATCH_OPERATION_CONTEXT,
  );

  const handleCheckboxChange = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    onSelectPage(checked, activities);
  };

  const label = translate('standalone-activities.select-all-activities');
</script>

<tr>
  {#if !empty && showBatchActions}
    <th scope="col" class="w-10">
      <Checkbox
        {label}
        labelHidden
        id="select-visible-activities"
        data-testid="batch-actions-checkbox"
        checked={pageSelectionStatus === 'checked'}
        indeterminate={pageSelectionStatus === 'partial'}
        on:change={handleCheckboxChange}
      />
    </th>
  {/if}
  <th scope="col" class="w-6"></th>
  {#if showBatchActions && $batchActionsVisible}
    <th
      scope="col"
      class="overflow-visible whitespace-nowrap font-medium"
      colspan={columnsCount}
    >
      <BatchActions {activities} />
    </th>
  {:else}
    {@render children?.()}
  {/if}
</tr>
