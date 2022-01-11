<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { getQuery, getQueryTypes } from '$lib/services/query-service';

  export async function load({ page, fetch: request }: LoadInput) {
    const { namespace, workflow: id, run: runId } = page.params;
    const workflow = { id, runId };

    const queryTypes = await getQueryTypes({ namespace, workflow });

    const queryTypeParameter = page.query.get('query-type');
    const queryType = queryTypes.includes(queryTypeParameter)
      ? queryTypeParameter
      : queryTypes[0];

    page.query.set('query-type', queryType);

    const queryResult = await getQuery(
      { namespace, workflow, queryType },
      request,
    );

    return {
      props: {
        namespace,
        workflow,
        queryType,
        queryTypes,
        queryResult,
      },
    };
  }
</script>

<script lang="ts">
  import { faPlay } from '@fortawesome/free-solid-svg-icons';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$lib/components/button.svelte';
  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';

  export let namespace: string;
  export let workflow: { id: string; runId: string };
  export let queryTypes: string[];
  export let queryType: string;
  export let queryResult: string;

  const fetchQuery = async () => {
    queryResult = await getQuery({ namespace, workflow, queryType });
  };

  $: console.log(queryResult);
</script>

<section>
  <div class="flex items-center gap-4">
    <FilterSelect label="Query Type" value={queryType} parameter="query-type">
      {#each queryTypes as value}
        <Option {value}>{value}</Option>
      {/each}
    </FilterSelect>
    <Button icon={faPlay} on:click={fetchQuery}>Run</Button>
  </div>
  <div class="flex items-start h-full">
    <CodeBlock content={queryResult} />
  </div>
</section>
