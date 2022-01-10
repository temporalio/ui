<script lang="ts">
  import { getContext } from 'svelte';
  import Icon from 'svelte-fa';
  import { faRedo } from '@fortawesome/free-solid-svg-icons';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { namespace } from '$lib/stores/namespace';
  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$lib/components/button.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  let workflow = getContext<PromiseLike<WorkflowExecution>>('workflow');

  let currentdate = new Date();
  let isLoading = true;

  $: datetime = currentdate.toLocaleTimeString();
  $: data = getWorkflowStackTrace({ workflow, namespace: $namespace });

  $: {
    isLoading = true;
    currentdate = new Date();
    data.then(() => {
      isLoading = false;
      new Date();
    });
  }

  const refreshStackTrace = () => {
    data = getWorkflowStackTrace({ workflow, namespace: $namespace });
    isLoading = true;
  };
</script>

{#await workflow then workflow}
  <section>
    {#if String(workflow.status) === 'Running'}
      <div class="flex items-center">
        <Button on:click={refreshStackTrace} loading={isLoading}>
          <span> <Icon icon={faRedo} scale={0.8} /></span>
          Refresh
        </Button>
        <p>Stack Trace at {datetime}</p>
      </div>
      {#await data then result}
        <div class="flex items-start h-full">
          <CodeBlock content={result} language="text" />
        </div>
      {/await}
    {:else}
      <EmptyState title="No Stack Traces Found" />
    {/if}
  </section>
{/await}

<style lang="postcss">
  p {
    @apply ml-2;
  }

  span {
    @apply mr-1;
  }
</style>
