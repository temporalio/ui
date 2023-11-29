<script lang="ts">
  import { page } from '$app/stores';

  import ChildWorkflowsTable from '$lib/components/workflow/child-workflows-table.svelte';
  import FirstPreviousNextWorkflowTable from '$lib/components/workflow/first-previous-next-workflow-table.svelte';
  import ParentWorkflowTable from '$lib/components/workflow/parent-workflow-table.svelte';
  import SchedulerTable from '$lib/components/workflow/scheduler-table.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ workflow } = $workflowRun);

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    if (!$fullEventHistory.length) {
      $fullEventHistory = await fetchAllEvents({
        namespace,
        workflowId,
        runId,
      });
    }
  };

  $: fetchEvents(namespace, workflowId, runId);

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $eventHistory,
    $fullEventHistory,
    $namespaces,
  );

  $: ({
    hasChildren,
    hasRelationships,
    first,
    parent,
    parentNamespaceName,
    children,
    next,
    previous,
    scheduleId,
  } = workflowRelationships);
</script>

<div class="flex flex-row items-center justify-center gap-2">
  <Icon name="relationship" />
  {#if scheduleId}
    <Badge type="purple">{translate('common.scheduled')}</Badge>
  {/if}
  <Badge type={parent ? 'purple' : 'gray'}
    >{translate('workflows.parents', { count: parent ? 1 : 0 })}</Badge
  >
  <Badge type={workflow.pendingChildren.length ? 'purple' : 'gray'}
    >{translate('workflows.pending-children', {
      count: workflow.pendingChildren.length,
    })}
  </Badge>
  <Badge type={children.length ? 'purple' : 'gray'}
    >{translate('workflows.children', { count: children.length })}</Badge
  >
  <Badge type={first ? 'purple' : 'gray'}
    >{translate('workflows.first', { count: first ? 1 : 0 })}</Badge
  >
  <Badge type={previous ? 'purple' : 'gray'}>
    {translate('workflows.previous', { count: previous ? 1 : 0 })}
  </Badge>
  <Badge type={next ? 'purple' : 'gray'}>
    {translate('workflows.next', { count: next ? 1 : 0 })}
  </Badge>
</div>
{#if hasRelationships}
  <div class="flex w-full flex-wrap gap-4">
    {#if scheduleId}
      <SchedulerTable {scheduleId} {namespace} />
    {/if}
    {#if parent}
      <ParentWorkflowTable {parent} {parentNamespaceName} {namespace} />
    {/if}
    {#if first || previous || next}
      <FirstPreviousNextWorkflowTable
        {first}
        {previous}
        {next}
        workflow={workflowId}
        {namespace}
      />
    {/if}
  </div>
  {#if hasChildren}
    <ChildWorkflowsTable
      {children}
      pendingChildren={workflow.pendingChildren}
      {namespace}
    />
  {/if}
{:else}
  <p>{translate('workflows.no-relationships')}</p>
{/if}
