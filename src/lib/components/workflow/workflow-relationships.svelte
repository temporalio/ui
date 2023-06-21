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
  import SchedulerTable from './scheduler-table.svelte';
  import { translate } from '$lib/i18n/translate';

  export let hasChildren: boolean;
  export let hasRelationships: boolean;
  export let first: string | undefined;
  export let parent: WorkflowIdentifier | undefined;
  export let parentNamespaceName: string | undefined;
  export let children: ChildWorkflowClosedEvent[];
  export let next: string | undefined;
  export let previous: string | undefined;
  export let scheduleId: string | undefined;

  $: ({ workflow, namespace } = $page.params);
</script>

<section>
  <Accordion
    title={translate('workflows', 'relationships')}
    icon="relationship"
  >
    <div slot="summary" class="hidden flex-row gap-2 lg:flex">
      {#if scheduleId}
        <Badge type="purple">{translate('scheduled')}</Badge>
      {/if}
      <Badge type={parent ? 'purple' : 'gray'}
        >{translate('workflows', 'parents', parent ? 1 : 0)}</Badge
      >
      <Badge
        type={$workflowRun.workflow.pendingChildren.length ? 'purple' : 'gray'}
        >{translate(
          'workflows',
          'pending-children',
          $workflowRun.workflow.pendingChildren.length,
        )}
      </Badge>
      <Badge type={children.length ? 'purple' : 'gray'}
        >{translate('workflows', 'children', children.length)}</Badge
      >
      <Badge type={first ? 'purple' : 'gray'}
        >{translate('workflows', 'first', first ? 1 : 0)}</Badge
      >
      <Badge type={previous ? 'purple' : 'gray'}>
        {translate('workflows', 'previous', previous ? 1 : 0)}
      </Badge>
      <Badge type={next ? 'purple' : 'gray'}>
        {translate('workflows', 'next', next ? 1 : 0)}
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
            {workflow}
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
      <p>{translate('workflows', 'no-relationships')}</p>
    {/if}
  </Accordion>
</section>
