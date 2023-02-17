<script lang="ts">
  import { page } from '$app/stores';
  import { getQuery, getQueryTypes } from '$lib/services/query-service';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Select from '$lib/holocene/select/simple-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { authUser } from '$lib/stores/auth-user';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  const params = {
    id: workflowId,
    runId,
  };

  let queryType: string;
  let isLoading = false;

  let queryTypes = getQueryTypes({
    namespace,
    workflow: params,
  }).then((queryTypes) => {
    queryType = queryType || queryTypes[0];
    return queryTypes;
  });

  let queryResult: Promise<string>;

  const query = (queryType: string) => {
    queryResult = getQuery(
      {
        namespace,
        workflow: params,
        queryType,
      },
      $page.data?.settings,
      $authUser?.accessToken,
    );
  };

  $: {
    queryType && query(queryType);
  }

  let jsonFormatting = true;
</script>

<section>
  {#await queryTypes}
    <div class="text-center">
      <Loading />
      <p>(This will fail if you have no workers running.)</p>
    </div>
  {:then types}
    <div class="flex justify-between">
      <div class="flex items-center gap-4">
        <Select
          id="query-select"
          label="Query Type"
          bind:value={queryType}
          testId="query-select"
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
      <div class="flex justify-end">
        <label
          for="json-formatting"
          class="flex items-center gap-4 font-secondary text-sm"
          >JSON Formatting
          <ToggleSwitch
            id="json-formatting"
            checked={jsonFormatting}
            on:change={() => (jsonFormatting = !jsonFormatting)}
          />
        </label>
      </div>
    </div>
    <div class="flex items-start h-full">
      {#await queryResult then result}
        <CodeBlock
          content={result}
          language={jsonFormatting ? 'json' : 'text'}
        />
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
