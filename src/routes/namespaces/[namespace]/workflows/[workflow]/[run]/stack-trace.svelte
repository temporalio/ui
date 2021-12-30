<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff }: LoadInput) {
    const { workflow } = stuff as {
      workflow: WorkflowExecution;
    };

    return {
      props: {
        workflow,
      },
    };
  }
</script>

<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';
  import Icon from 'svelte-fa';
  import { namespace } from '$lib/stores/namespace';
  import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
  import Button from '$lib/components/button.svelte';
  import { getWorkflowStackTrace } from '$lib/services/query-service';

  export let workflow: WorkflowExecution;

  let currentdate = new Date();
  $: datetime = currentdate.toLocaleTimeString();
  $: data = getWorkflowStackTrace({ workflow, namespace: $namespace });
</script>

<section>
  {#if String(workflow.status) === 'Running'}
    <div class="flex items-center">
      <Button
        on:click={() => {
          data = getWorkflowStackTrace({ workflow, namespace: $namespace });
          currentdate = new Date();
        }}
      >
        <Icon icon={faSyncAlt} scale={0.8} class="block w-full h-full" />
        Refresh</Button
      >
      <p class="ml-9">Stack Trace at {datetime}</p>
    </div>
    {#await data}
      <div>loading</div>
    {:then { queryResult }}
      <CodeBlock content={queryResult.payloads[0].data} />
    {/await}
  {:else}
    <h2>Will add empty state</h2>
  {/if}
</section>
