<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import StartActivityButton from '$lib/components/standalone-activities/start-activity-button.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
    activityKey,
  } from '$lib/pages/standalone-activities.svelte';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { standaloneActivityWriteActionsDisabled } from '$lib/utilities/standalone-activities-commands-disabled';

  interface Props {
    activity?: ActivityExecutionInfo;
    empty?: boolean;
    showBatchActions?: boolean;
    onClickBatchSelect?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    activity,
    empty = false,
    showBatchActions = false,
    onClickBatchSelect = () => {},
    children,
  }: Props = $props();

  const { allSelected, selectedActivities } =
    getContext<ActivityBatchOperationContext>(ACTIVITY_BATCH_OPERATION_CONTEXT);

  const namespace = $derived(page.params.namespace);
  const activityStartEnabled = $derived(
    !standaloneActivityWriteActionsDisabled(page),
  );

  const label = $derived(
    translate('standalone-activities.select-activity', {
      activity: activity?.activityId ?? '',
    }),
  );

  const checked = $derived(
    $allSelected ||
      (!!activity &&
        $selectedActivities.some(
          (a) => activityKey(a) === activityKey(activity),
        )),
  );
</script>

<tr
  data-testid="activities-summary-configurable-table-row"
  class:empty
  class="dense"
>
  {#if !empty && activity}
    {#if showBatchActions}
      <td class="relative">
        <Checkbox
          data-testid="batch-checkbox"
          {label}
          labelHidden
          on:click={onClickBatchSelect}
          {checked}
          value={activity}
          disabled={$allSelected}
          aria-label={label}
        />
      </td>
    {/if}
    {#if activityStartEnabled}
      <td class="relative flex items-center justify-center py-0.5">
        <StartActivityButton
          {namespace}
          activityId={activity.activityId ?? ''}
          activityType={activity.activityType?.name ?? ''}
          taskQueue={activity.taskQueue ?? ''}
          scheduleToCloseTimeout={activity.scheduleToCloseTimeout}
          startToCloseTimeout={activity.startToCloseTimeout}
        />
      </td>
    {:else}
      <td></td>
    {/if}
  {:else}
    <td></td>
  {/if}
  {@render children?.()}
</tr>
