<script lang="ts">
  import { page } from '$app/stores';

  import ChildWorkflowsTable from '$lib/components/workflow/child-workflows-table.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  import FirstPreviousNextWorkflowTable from './first-previous-next-workflow-table.svelte';
  import ParentWorkflowTable from './parent-workflow-table.svelte';
  import SchedulerTable from './scheduler-table.svelte';

  $: ({ workflow: workflowId, namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
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

<div class="flex flex-col gap-4">
  <div
    class="grid grid-cols-2 items-center justify-center gap-2 lg:flex lg:flex-row"
  >
    {#if scheduleId}
      <Card class="flex grow items-center justify-center bg-blurple text-white">
        {translate('common.scheduled')}
      </Card>
    {/if}
    <Card
      class="surface-inverse flex grow items-center justify-center {parent &&
        'bg-blurple text-white'}"
    >
      {translate('workflows.parents', { count: parent ? 1 : 0 })}
    </Card>
    <Card
      class="surface-inverse flex grow items-center justify-center {$workflowRun
        .workflow.pendingChildren.length && 'bg-blurple text-white'}"
    >
      {translate('workflows.pending-children', {
        count: $workflowRun.workflow.pendingChildren.length,
      })}
    </Card>
    <Card
      class="surface-inverse flex grow items-center justify-center {children.length &&
        'bg-blurple text-white'}"
    >
      {translate('workflows.children', { count: children.length })}
    </Card>
    <Card
      class="surface-inverse flex grow items-center justify-center {first &&
        'bg-blurple text-white'}"
    >
      {translate('workflows.first', { count: first ? 1 : 0 })}
    </Card>
    <Card
      class="surface-inverse flex grow items-center justify-center {previous &&
        'bg-blurple text-white'}"
    >
      {translate('workflows.previous', { count: previous ? 1 : 0 })}
    </Card>
    <Card
      class="surface-inverse flex grow items-center justify-center {next &&
        'bg-blurple text-white'}"
    >
      {translate('workflows.next', { count: next ? 1 : 0 })}
    </Card>
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
        pendingChildren={$workflowRun.workflow.pendingChildren}
        namespace={$page.params.namespace}
      />
    {/if}
  {:else}
    <p>{translate('workflows.no-relationships')}</p>
  {/if}
</div>
