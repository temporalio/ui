<script lang="ts">
  import { getContext } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/activities-with-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';

  interface Props {
    activity?: ActivityExecutionInfo;
    empty?: boolean;
  }

  let { activity = undefined, empty = false }: Props = $props();

  const { allSelected, selectedActivities } =
    getContext<ActivityBatchOperationContext>(ACTIVITY_BATCH_OPERATION_CONTEXT);

  const label = $derived(
    translate('activities.select-activity', {
      activity: activity?.activityId,
    }),
  );
</script>

<tr
  data-testid="activities-summary-configurable-table-row"
  class:empty
  class="dense"
>
  {#if !empty && $supportsBulkActions}
    <td class="relative">
      <Checkbox
        {label}
        labelHidden
        bind:group={$selectedActivities}
        value={activity}
        disabled={$allSelected}
        aria-label={label}
      />
    </td>
    <td class="w-6"></td>
  {:else}
    <td></td>
  {/if}
  <slot />
</tr>
