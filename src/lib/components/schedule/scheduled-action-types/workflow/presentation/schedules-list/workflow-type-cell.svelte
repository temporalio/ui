<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import Link from '$lib/holocene/link.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';

  import type { WorkflowScheduleListEntry } from '../../types';

  type Props = {
    schedule: WorkflowScheduleListEntry;
    namespace: string;
    width?: number;
  };

  let { schedule, namespace, width }: Props = $props();

  const workflowTypeName = $derived(schedule.info.workflowType.name ?? '');
  const widthStyle = $derived(columnWidthStyle(width));
  const clampToWidth = $derived(
    width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES,
  );
  const filterRoute = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: [
        workflowTypeName && `WorkflowType="${workflowTypeName}"`,
        schedule.scheduleId && `TemporalScheduledById="${schedule.scheduleId}"`,
      ]
        .filter(Boolean)
        .join(' AND '),
    }),
  );
</script>

<TableCellWithFilterOrCopyButtons
  class={twMerge('whitespace-pre-line break-words p-2 text-left', clampToWidth)}
  style={widthStyle}
  filterIconTitle={translate('common.filter-workflows')}
  copyValue={workflowTypeName}
  onFilter={() => {
    if (filterRoute) {
      goto(filterRoute);
    }
  }}
>
  {#if filterRoute}
    <Link href={filterRoute}>
      {workflowTypeName}
    </Link>
  {:else}
    {workflowTypeName}
  {/if}
</TableCellWithFilterOrCopyButtons>
