<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    routeForWorkers,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  export let workflow: WorkflowExecution;

  $: ({ namespace } = $page.params);

  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
</script>

<Table>
  <TableRow>
    <td class="font-mono">{translate('common.start')}</td>
    <td
      >{formatDate(workflow?.startTime, $timeFormat, {
        relative: $relativeTime,
      })}</td
    >
  </TableRow>
  <TableRow>
    <td class="font-mono">{translate('common.end')}</td>
    <td
      >{formatDate(workflow?.endTime, $timeFormat, {
        relative: $relativeTime,
      })}</td
    >
  </TableRow>
  <TableRow>
    <td><Icon name="clock" /></td>
    <td>{elapsedTime}</td>
  </TableRow>
  <TableRow>
    <td class="font-mono">{translate('common.run-id')}</td>
    <td>{workflow?.runId}</td>
  </TableRow>
  <TableRow>
    <td class="font-mono">{translate('common.workflow-type')}</td>
    <td
      ><Link
        href={routeForWorkflowsWithQuery({
          namespace,
          query: `WorkflowType="${workflow?.name}"`,
        })}>{workflow?.name}</Link
      ></td
    >
  </TableRow>
  <TableRow>
    <td class="font-mono">{translate('common.task-queue')}</td>
    <td
      ><Link
        href={routeForWorkers({
          namespace,
          workflow: workflow?.id,
          run: workflow?.runId,
        })}>{workflow?.taskQueue}</Link
      ></td
    >
  </TableRow>
</Table>
