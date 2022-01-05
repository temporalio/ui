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
  import { faRedo } from '@fortawesome/free-solid-svg-icons';
  import Button from '$lib/components/button.svelte';
  import { getWorkflowStackTrace } from '$lib/services/query-service';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let workflow: WorkflowExecution;

  let currentdate = new Date();
  $: datetime = currentdate.toLocaleTimeString();
  $: data =
    String(workflow.status) === 'Running'
      ? getWorkflowStackTrace({ workflow, namespace: $namespace })
      : null;

  const refreshStackTrace = () => {
    data =
      String(workflow.status) === 'Running'
        ? getWorkflowStackTrace({ workflow, namespace: $namespace })
        : null;
    currentdate = new Date();
  };
</script>

<section>
  {#if String(workflow.status) === 'Running'}
    <div class="flex items-center">
      <Button on:click={refreshStackTrace}>
        <span> <Icon icon={faRedo} scale={0.8} class="block w-full" /></span>
        Refresh</Button
      >
      <p>Stack Trace at {datetime}</p>
    </div>
    {#await data}
      <div>loading</div>
    {:then { queryResult }}
      <div class="flex items-start h-full">
        <CodeBlock content={window.atob(queryResult.payloads[0].data)} />
      </div>
    {/await}
  {:else}
    <EmptyState title="No Stack Traces Found" />
  {/if}
</section>

<style lang="postcss">
  p {
    @apply ml-2;
  }

  span {
    @apply mr-1;
  }
</style>
