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
    <div class="flex justify-between items-start mb-8">
      <h1 class="text-base w-auto md:text-2xl md:flex relative items-center">
        <span class="mr-2">
          <WorkflowStatus status={workflow?.status} delay={0} />
        </span>
        <span class="font-medium">{workflow.id}</span>
        <h1 class="text-base md:text-2xl relative w-auto">
          <span class="font-medium break-all">{workflow.id}</span>
          <span class="block md:inline mr-2">
            <WorkflowStatus status={workflow?.status} delay={0} />
            <span class="font-medium">{workflow.id}</span>
          </span>
        </h1>
        <div class="ml-8 flex justify-end items-center gap-4">
          <ExportHistory />
          <TerminateWorkflow {workflow} {namespace} />
        </div>
      </h1>
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
    {#if historyActive}
      <p class="text-md">
        <span class="font-medium">Workflow Type:</span>
        <span class="ml-1">{workflow.name}</span>
      </p>
      <p class="text-md">
        <span class="font-medium">Run ID:</span>
        <span class="ml-1">{workflow.runId}</span>
      </p>
      <div class="text-md md:flex gap-6">
        <p>
          <span class="font-medium">Start Time:</span>
          <span class="ml-1">{formatDate(workflow.startTime, 'UTC')}</span>
        </p>
        <p>
          <span class="font-medium">Closed Time:</span>
          <span class="ml-1">{formatDate(workflow.endTime, 'UTC')}</span>
        </p>
      </div>
      <p class="text-md">
        <span class="font-medium">Task Queue:</span>
        <span class="ml-1"
          ><Link href={routeForWorkers(routeParameters)}
            >{workflow.taskQueue}</Link
          ></span
        >
      </p>
      {#if workflow?.parent}
        <p class="text-md">
          <span class="font-medium">Parent:</span>
          <span class="ml-1"
            ><Link
              href={routeForWorkflow({
                namespace,
                workflow: workflow.parent?.workflowId,
                run: workflow.parent?.runId,
              })}>{workflow.parent?.workflowId}</Link
            ></span
          >
        </p>
      {/if}
      <p class="text-md">
        <span class="font-medium">State Transitions:</span>
        <span class="ml-1">{workflow.stateTransitionCount}</span>
      </p>
    {/if}
  </main>
</header>
