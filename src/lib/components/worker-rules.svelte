<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    type GetPollersResponse,
    type TaskQueueRules,
  } from '$lib/services/pollers-service';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  export let workers: GetPollersResponse;
  export let rules: TaskQueueRules | undefined = undefined;

  $: ({ assignmentRules, compatibleRedirectRules } = rules);
</script>

<h2 class="text-base font-medium" data-testid="worker-rules">
  {translate('workers.assignment-rules')}
</h2>
<Table class="mb-6 w-full table-fixed">
  <TableHeaderRow slot="headers">
    <th class="w-2/3">Target Build ID</th>
    <th class="w-1/3 text-right">Create Time</th>
  </TableHeaderRow>
  {#each assignmentRules as rule, index (index)}
    <TableRow data-testid="version-row">
      <td class="text-left" data-testid="target-source"
        >{rule.rule.targetBuildId}</td
      >
      <td class="text-right" data-testid="target-source"
        >{formatDate(rule.createTime, $timeFormat)}</td
      >
    </TableRow>
  {:else}
    <tr class="w-full">
      <td colspan="6">
        <EmptyState title={translate('workers.no-assignment-rules-found')} />
      </td>
    </tr>
  {/each}
</Table>

<h2 class="text-base font-medium" data-testid="worker-rules">
  {translate('workers.redirect-rules')}
</h2>
<Table class="mb-6 w-full table-fixed">
  <TableHeaderRow slot="headers">
    <th class="w-1/3">Source Build ID</th>
    <th class="w-1/3">Target Build ID</th>
    <th class="w-1/3">Create Time</th>
  </TableHeaderRow>
  {#each compatibleRedirectRules as rule, index (index)}
    <TableRow data-testid="version-row">
      <td class="text-left" data-testid="target-source"
        >{rule.rule.sourceBuildId}</td
      >
      <td class="text-left" data-testid="target-source"
        >{rule.rule.targetBuildId}</td
      >
      <td class="text-left" data-testid="target-source"
        >{formatDate(rule.createTime, $timeFormat)}</td
      >
    </TableRow>
  {:else}
    <tr class="w-full">
      <td colspan="6">
        <EmptyState title={translate('workers.no-redirect-rules-found')} />
      </td>
    </tr>
  {/each}
</Table>

<h2 class="flex items-center gap-2 text-base font-medium" data-testid="workers">
  {translate('workers.workers')}
  <Badge type="count" class="rounded-sm">{workers?.pollers?.length || 0}</Badge>
</h2>
<Table class="mb-6 w-full min-w-[600px] table-fixed">
  <caption class="sr-only" slot="caption"
    >{translate('workflows.workers-tab')}</caption
  >
  <TableHeaderRow slot="headers">
    <th class={'w-3/12'}>{translate('common.id')}</th>
    <th class="w-3/12">{translate('workers.buildId')}</th>
    <th class="w-2/12">{translate('workflows.last-accessed')}</th>
    <th class="w-2/12">
      <p class="text-center">
        {translate('workflows.workflow-task-handler')}
      </p>
    </th>
    <th class="w-2/12 text-center">
      <p class="text-center">{translate('workflows.activity-handler')}</p>
    </th>
  </TableHeaderRow>
  {#each workers?.pollers as poller (poller.identity)}
    <TableRow data-testid="worker-row">
      <td class="text-left" data-testid="worker-identity">
        <p class="select-all">{poller.identity}</p>
      </td>
      <td class="text-left" data-testid="worker-identity">
        <p class="select-all">
          <CompatibilityBadge
            active
            buildId={poller?.workerVersionCapabilities?.buildId}
          />
        </p>
      </td>
      <td class="text-left" data-testid="worker-last-access-time">
        <p class="select-all">
          {formatDate(poller.lastAccessTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>
      </td>
      <td data-testid="workflow-poller">
        {#if poller.taskQueueTypes.includes('WORKFLOW')}
          <Icon
            name="checkmark"
            class="m-auto text-blue-700"
            title={translate('common.yes')}
          />
        {:else}
          <Icon
            name="close"
            class="m-auto text-primary"
            title={translate('common.no')}
          />
        {/if}
      </td>
      <td data-testid="activity-poller">
        {#if poller.taskQueueTypes.includes('ACTIVITY')}
          <Icon
            name="checkmark"
            class="m-auto text-blue-700"
            title={translate('common.yes')}
          />
        {:else}
          <Icon
            name="close"
            class="m-auto text-primary"
            title={translate('common.no')}
          />
        {/if}
      </td>
    </TableRow>
  {:else}
    <tr class="w-full">
      <td colspan={6}>
        <EmptyState title={translate('workflows.workers-empty-state')} />
      </td>
    </tr>
  {/each}
</Table>
