<script lang="ts">
  import Icon from 'svelte-fa';
  import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

  import { page } from '$app/stores';
  import {
    routeForEventHistory,
    routeForPendingActivities,
    routeForStackTrace,
    routeForWorkers,
    routeForWorkflowQuery,
    routeForWorkflow,
  } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';

  import type { GetPollersResponse } from '$lib/services/pollers-service';
  import Link from '$lib/components/link.svelte';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';
  import ExportHistory from '$lib/components/export-history.svelte';
  import Tab from '$lib/components/tab.svelte';
  import WorkflowDetail from './_workflow-detail.svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;

  const routeParameters = {
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  };

  $: historyActive = $page.url.pathname.includes(
    routeForEventHistory(routeParameters),
  );
</script>

<header class="flex flex-col gap-4">
  <main class="flex flex-col gap-1 relative">
    <a
      href="/namespaces/{namespace}/workflows"
      class="absolute top-2 back-to-workflows"
      style="left: -1.5rem"
    >
      <Icon icon={faChevronLeft} />
    </a>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl flex relative items-center gap-4">
        <WorkflowStatus status={workflow?.status} />
        <span class="font-medium select-all">{workflow.id}</span>
      </h1>
      <div class="ml-8 flex justify-end items-center gap-4">
        <ExportHistory />
        <TerminateWorkflow {workflow} {namespace} />
      </div>
    </div>
    <nav class="flex gap-6 mb-6">
      <Tab
        label="History"
        href={routeForEventHistory(routeParameters)}
        amount={workflow?.historyEvents}
      />
      <Tab
        label="Workers"
        href={routeForWorkers(routeParameters)}
        amount={workers?.pollers?.length}
      />
      <Tab
        label="Pending Activities"
        href={routeForPendingActivities(routeParameters)}
        amount={workflow.pendingActivities?.length}
      />
      <Tab label="Stack Trace" href={routeForStackTrace(routeParameters)} />
      <Tab label="Queries" href={routeForWorkflowQuery(routeParameters)} />
    </nav>
    <section class="flex flex-col gap-1">
      {#if historyActive}
        <WorkflowDetail title="Workflow Type" content={workflow.name} />
        <WorkflowDetail title="Run ID" content={workflow.runId} />
        <div class="flex gap-6">
          <WorkflowDetail
            title="Start Time"
            content={formatDate(workflow.startTime, 'UTC')}
          />
          <WorkflowDetail
            title="Close Time"
            content={formatDate(workflow.endTime, 'UTC')}
          />
        </div>
        <WorkflowDetail
          title="Task Queue"
          content={workflow.taskQueue}
          href={routeForWorkers(routeParameters)}
        />
        {#if workflow?.parent}
          <WorkflowDetail
            title="Parent"
            content={workflow.parent?.workflowId}
            href={routeForWorkflow({
              namespace,
              workflow: workflow.parent?.workflowId,
              run: workflow.parent?.runId,
            })}
          />
        {/if}
        <WorkflowDetail
          title="State Transitions"
          content={workflow.stateTransitionCount}
        />
      {/if}
    </section>
  </main>
</header>
