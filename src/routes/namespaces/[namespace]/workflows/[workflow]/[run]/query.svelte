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
  import CodeBlock from '$lib/components/code-block.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import Select from '$lib/components/select/select.svelte';

  export let namespace: string;
  export let workflow: { id: string; runId: string };

  let queryType: string;

  let queryTypes = getQueryTypes({
    namespace,
    workflow,
  }).then((queryTypes) => {
    queryType = queryType || queryTypes[0];
    return queryTypes;
  });

  $: queryResult = queryType && getQuery({ namespace, workflow, queryType });
</script>

<section>
  {#await queryTypes}
    <div class="text-center">
      <h2 class="font-bold text-2xl mb-4">Loading…</h2>
      <p>(This will fail if you have no workers running.)</p>
    </div>
  {:then types}
    <div class="flex items-center gap-4">
      <Select label="Query Type" value={queryType}>
        {#each types as value}
          <Option {value}>{value}</Option>
        {/each}
      </Select>
    </div>
    <div class="flex items-start h-full">
      <CodeBlock content={queryResult} />
    </div>
  {:catch}
    <EmptyState
      title="An Error Occurred"
      content="Please make sure you have at least one worker running."
    />
  {/await}
</section>
