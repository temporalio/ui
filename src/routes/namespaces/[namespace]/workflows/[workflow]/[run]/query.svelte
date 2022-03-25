<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { getQuery, getQueryTypes } from '$lib/services/query-service';

  export const load: Load = async function ({ params, stuff }) {
    const { namespace } = params;
    const { workflow } = stuff;

    return {
      props: {
        namespace,
        workflow: { id: workflow.id, runId: workflow.runId },
      },
    };
  };
</script>

<script lang="ts">
  import { faRedo } from '@fortawesome/free-solid-svg-icons';
  import CodeBlock from '$lib/components/code-block.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import Select from '$lib/components/select/select.svelte';
  import Button from '$lib/components/button.svelte';

  export let namespace: string;
  export let workflow: { id: string; runId: string };

  let queryType: string;
  let isLoading = false;

  let queryTypes = getQueryTypes({
    namespace,
    workflow,
  }).then((queryTypes) => {
    queryType = queryType || queryTypes[0];
    return queryTypes;
  });

  let queryResult: string;

  const query = async (queryType: string) => {
    queryResult = await getQuery({ namespace, workflow, queryType });
  };

  $: {
    queryType && query(queryType);
  }
</script>

<section>
  {#await queryTypes}
    <div class="text-center">
      <h2 class="font-bold text-2xl mb-4">Loading…</h2>
      <p>(This will fail if you have no workers running.)</p>
    </div>
  {:then types}
    <div class="flex items-center gap-4">
      <Select label="Query Type" bind:value={queryType}>
        {#each types as value}
          <Option {value}>{value}</Option>
        {/each}
      </Select>
      <Button
        on:click={() => query(queryType)}
        icon={faRedo}
        loading={isLoading}
      >
        Refresh
      </Button>
    </div>
    <div class="flex items-start h-full">
      <CodeBlock content={queryResult}/>
    </div>
  {:catch}
    <EmptyState
      title="An Error Occurred"
      content="Please make sure you have at least one worker running."
    />
  {/await}
</section>
