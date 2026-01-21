<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import StartActivityButton from '$lib/components/activity/start-activity-button.svelte';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';

  interface Props {
    activity?: ActivityExecutionInfo;
    empty?: boolean;
    children?: Snippet;
  }

  let { activity, empty = false, children }: Props = $props();

  const namespace = $derived(page.params.namespace);
</script>

<tr
  data-testid="activities-summary-configurable-table-row"
  class:empty
  class="dense"
>
  {#if !empty && activity}
    <td class="relative flex items-center justify-center py-0.5">
      <StartActivityButton
        {namespace}
        activityId={activity.activityId}
        activityType={activity.activityType?.name ?? ''}
        taskQueue={activity.taskQueue}
        scheduleToCloseTimeout={activity.scheduleToCloseTimeout}
        startToCloseTimeout={activity.startToCloseTimeout}
      />
    </td>
  {:else}
    <td></td>
  {/if}
  {@render children?.()}
</tr>
