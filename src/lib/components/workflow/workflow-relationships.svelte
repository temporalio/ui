<script lang="ts">
  import { page } from '$app/stores';
  import { eventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import Accordion from '$lib/holocene/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import ChildWorkflowsTable from '$lib/components/workflow/child-workflows-table.svelte';
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';

  $: children = $workflowRun.workflow?.pendingChildren.length;
  $: parent = $workflowRun.workflow?.parent;
  $: lastEvent = $eventHistory.end[0];
  $: firstEvent = $eventHistory.start[0];
  $: firstExecutionRunId =
    firstEvent?.workflowExecutionStartedEventAttributes?.firstExecutionRunId;
  $: first =
    firstExecutionRunId === $workflowRun.workflow?.runId
      ? undefined // don't show first if it is the same as the current workflow run ID
      : firstExecutionRunId;
  $: previous =
    firstEvent?.workflowExecutionStartedEventAttributes
      ?.continuedExecutionRunId;
  $: next =
    lastEvent?.workflowExecutionContinuedAsNewEventAttributes
      ?.newExecutionRunId;
  $: continued = first || previous || next;
  $: hasRelationships = parent || children || continued;

  const { workflow, namespace } = $page.params;
</script>

<Accordion title="Relationships" icon="relationship">
  <div slot="summary" class="hidden flex-row gap-2 lg:flex">
    <Badge type={parent ? 'purple' : 'gray'}>{parent ? 1 : 0} Parent</Badge>
    <Badge type={children ? 'purple' : 'gray'}>{children} Children</Badge>
    <Badge type={first ? 'purple' : 'gray'}>{first ? 1 : 0} First</Badge>
    <Badge type={previous ? 'purple' : 'gray'}
      >{previous ? 1 : 0} Previous</Badge
    >
    <Badge type={next ? 'purple' : 'gray'}>{next ? 1 : 0} Next</Badge>
  </div>
  <div class="grid-row-3 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
    {#if hasRelationships}
      {#if parent}
        <div class="col-span-2 lg:col-span-1">
          <h3 class="font-medium">Parent</h3>
          <div class="h-0.5 w-full rounded-full bg-gray-900" />
          <WorkflowDetail
            title="Workflow ID"
            content={$workflowRun.workflow.parent?.workflowId}
            href={routeForEventHistory({
              namespace,
              workflow: $workflowRun.workflow.parent?.workflowId,
              run: $workflowRun.workflow.parent?.runId,
            })}
          />
          <WorkflowDetail
            title="Run ID"
            content={$workflowRun.workflow.parent?.runId}
            href={routeForEventHistory({
              namespace,
              workflow: $workflowRun.workflow.parent?.workflowId,
              run: $workflowRun.workflow.parent?.runId,
            })}
          />
        </div>
      {/if}
      {#if continued}
        <div class="col-span-2 lg:col-span-1">
          <h3 class="font-medium">Continued</h3>
          <div class="h-0.5 w-full rounded-full bg-gray-900" />
          {#if first}
            <WorkflowDetail
              title="First Execution Run ID"
              content={first}
              href={routeForEventHistory({
                namespace,
                workflow,
                run: first,
              })}
            />
          {/if}
          {#if previous}
            <WorkflowDetail
              title="Continued Execution Run ID"
              content={previous}
              href={routeForEventHistory({
                namespace,
                workflow,
                run: previous,
              })}
            />
          {/if}
          {#if next}
            <WorkflowDetail
              title="New Execution Run ID"
              content={next}
              href={routeForEventHistory({
                namespace,
                workflow,
                run: next,
              })}
            />
          {/if}
        </div>
      {/if}
      {#if $workflowRun.workflow?.pendingChildren.length}
        <div class="col-span-2">
          <ChildWorkflowsTable
            pendingChildren={$workflowRun.workflow?.pendingChildren}
            namespace={$page.params.namespace}
          />
        </div>
      {/if}
    {:else}
      <p class="col-span-2">This workflow doesn’t have any relationships</p>
    {/if}
  </div>
</Accordion>
