<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  import {
    fetchWorkflow,
    fetchEvents,
  } from '$lib/services/workflow-execution-service';

  export async function load({ fetch, page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;

    const execution = await fetchWorkflow(
      {
        executionId,
        runId,
        namespace,
      },
      fetch,
    );

    const events = await fetchEvents(
      {
        executionId,
        runId,
        namespace,
      },
      fetch,
    );

    return {
      props: {
        execution,
      },
      stuff: {
        execution,
        events,
      },
    };
  }
</script>

<script lang="ts">
  import type { DescribeWorkflowExecutionResponse } from '$types';

  import { fly } from 'svelte/transition';
  import { isFullScreen } from '$lib/stores/full-screen';
  import { toWorkflowExecution } from '$lib/models/workflow-execution';

  import Header from './_header.svelte';

  export let execution: DescribeWorkflowExecutionResponse;

  $: workflow = toWorkflowExecution(execution);
</script>

<section
  class="border-l-2 h-screen"
  class:full={$isFullScreen}
  class:sidebar={!$isFullScreen}
  in:fly={{ x: 500, duration: 350 }}
  out:fly={{ x: 500 }}
>
  <main class="w-full">
    <Header {workflow} />
    <slot />
  </main>
</section>

<style type="postcss">
  .full {
    @apply w-full;
  }

  .sidebar {
    background-color: white;
    width: 600px;
    left: calc(100% - 600px);
    position: absolute;
    overflow-y: scroll;
    box-shadow: -2px 14px 20px 0px rgb(0 0 0 / 20%);
    z-index: 2;
  }
</style>
