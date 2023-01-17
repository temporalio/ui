<script lang="ts">
  import { page } from '$app/stores';
  import { getQuery, getQueryTypes } from '$lib/services/query-service';
  import { workflowRun } from '$lib/stores/workflow-run';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Select from '$lib/holocene/select/simple-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { authUser } from '$lib/stores/auth-user';

  const { namespace } = $page.params;
  $: ({ workflow } = $workflowRun);

  $: workflowParams = {
    id: workflow?.id,
    runId: workflow?.runId,
  };

  let queryType: string;
  let isLoading = false;

  let queryTypes = getQueryTypes({
    namespace,
    workflow: workflowParams,
  }).then((queryTypes) => {
    queryType = queryType || queryTypes[0];
    return queryTypes;
  });

  let queryResult: Promise<string>;

  const query = (queryType: string) => {
    queryResult = getQuery(
      {
        namespace,
        workflow: workflowParams,
        queryType,
      },
      $page.data?.settings,
      $authUser?.accessToken,
    );
  };

  $: {
    queryType && query(queryType);
  }
</script>

<section>
  {#await queryTypes}
    <div class="text-center">
      <Loading />
      <p>(This will fail if you have no workers running.)</p>
    </div>
  {:then types}
    <div class="flex items-center gap-4">
      <Select
        id="query-select"
        label="Query Type"
        bind:value={queryType}
        dataCy="query-select"
      >
        {#each types as value}
          <Option {value}>{value}</Option>
        {/each}
      </Select>
      <Button
        on:click={() => query(queryType)}
        icon="retry"
        loading={isLoading}
      >
        Refresh
      </Button>
    </div>
    <div class="flex items-start h-full">
      {#await queryResult then result}
        <CodeBlock content={result} />
      {/await}
    </div>
  {:catch _error}
    <EmptyState
      title="An Error Occurred"
      content="Please make sure you have at least one worker running."
      error={_error?.message}
    />
  {/await}
</section>
