<script>import { page } from '$app/stores';
import { getQuery, getQueryTypes } from '../services/query-service';
import { workflowRun } from '../stores/workflow-run';
import CodeBlock from '../holocene/code-block.svelte';
import Select from '../holocene/select/simple-select.svelte';
import Option from '../holocene/select/simple-option.svelte';
import EmptyState from '../holocene/empty-state.svelte';
import Button from '$holocene/button.svelte';
import PageTitle from '../holocene/page-title.svelte';
import Loading from '../holocene/loading.svelte';
const { namespace } = $page.params;
const { workflow } = $workflowRun;
const workflowParams = {
    id: workflow.id,
    runId: workflow.runId,
};
let queryType;
let isLoading = false;
let queryTypes = getQueryTypes({
    namespace,
    workflow: workflowParams,
}).then((queryTypes) => {
    queryType = queryType || queryTypes[0];
    return queryTypes;
});
let queryResult;
const query = (queryType) => {
    queryResult = getQuery({ namespace, workflow: workflowParams, queryType });
};
$: {
    queryType && query(queryType);
}
</script>

<PageTitle title={`Query | ${workflow.id}`} url={$page.url.href} />
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
