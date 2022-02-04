<script lang="ts">
  import Icon from 'svelte-fa';
  import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';
  import Tabs from './_tabs.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  export let namespace: string;

  let workflow = getAppContext('workflow');
</script>

{#await $workflow then workflow}
  <header class="flex flex-col gap-4">
    <main class="flex flex-col gap-1 relative">
      <a
        href="/namespaces/{namespace}/workflows"
        class="absolute top-2 back-to-workflows"
        style="left: -1.5rem"
      >
        <Icon icon={faChevronLeft} />
      </a>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl">
          {workflow.name}
          <WorkflowStatus status={workflow?.status} />
        </h1>
        <TerminateWorkflow {workflow} {namespace} />
      </div>
      <p class="text-md">
        <span>Workflow ID</span>
        <span class="font-medium">{workflow.id}</span>
      </p>
      <p class="text-md">
        <span>Run ID</span>
        <span class="font-medium">{workflow.runId}</span>
      </p>
    </main>
    <Tabs {workflow} />
  </header>
{/await}
