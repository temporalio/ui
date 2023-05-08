<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import Accordion from '$lib/holocene/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import ChildWorkflowsTable from '$lib/components/workflow/child-workflows-table.svelte';

  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import type { ChildWorkflowClosedEvent } from '$lib/utilities/get-workflow-relationships';
  import ParentWorkflowTable from './parent-workflow-table.svelte';
  import FirstPreviousNextWorkflowTable from './first-previous-next-workflow-table.svelte';

  export let hasChildren: boolean;
  export let hasRelationships: boolean;
  export let first: string | undefined;
  export let parent: WorkflowIdentifier | undefined;
  export let parentNamespaceName: string | undefined;
  export let children: ChildWorkflowClosedEvent[];
  export let next: string | undefined;
  export let previous: string | undefined;

  $: ({ workflow, namespace } = $page.params);
</script>

<section>
  <Accordion title="Relationships" icon="relationship">
    <div slot="summary" class="hidden flex-row gap-2 lg:flex">
      <Badge type={parent ? 'purple' : 'gray'}>{parent ? 1 : 0} Parent</Badge>
      <Badge
        type={$workflowRun.workflow.pendingChildren.length ? 'purple' : 'gray'}
        >{$workflowRun.workflow.pendingChildren.length} Pending Children</Badge
      >
      <Badge type={children.length ? 'purple' : 'gray'}
        >{children.length} Children</Badge
      >
      <Badge type={first ? 'purple' : 'gray'}>{first ? 1 : 0} First</Badge>
      <Badge type={previous ? 'purple' : 'gray'}>
        {previous ? 1 : 0} Previous
      </Badge>
      <Badge type={next ? 'purple' : 'gray'}>{next ? 1 : 0} Next</Badge>
    </div>
    {#if hasRelationships}
      <div class="flex w-full flex-wrap gap-4">
        {#if parent}
          <ParentWorkflowTable {parent} {parentNamespaceName} {namespace} />
        {/if}
        {#if first || previous || next}
          <FirstPreviousNextWorkflowTable
            {first}
            {previous}
            {next}
            {workflow}
            {namespace}
          />
        {/if}
      </div>
      {#if hasChildren}
        <ChildWorkflowsTable
          {children}
          pendingChildren={$workflowRun.workflow?.pendingChildren}
          {namespace}
        />
      {/if}
    {:else}
      <p>This workflow doesn’t have any relationships</p>
    {/if}
  </Accordion>
</section>
