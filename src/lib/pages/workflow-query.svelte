<script lang="ts">
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import Select from '$lib/holocene/select/simple-select.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    getQuery,
    getQueryTypes,
    type ParsedQuery,
  } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

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

  let queryResult: Promise<ParsedQuery>;

  const query = (queryType: string, queryArgs: string) => {
    queryResult = getQuery(
      {
        namespace,
        workflow: params,
        queryType,
        queryArgs
      },
      $page.data?.settings,
      $authUser?.accessToken,
    );
  };

  export let queryArgs = '';
  export let queryArgsValid = true;
  const handleQueryArgsChange = (event: CustomEvent<string>) => {
    queryArgs = event.detail;
    try {
      if (queryArgs === '') {
        queryArgsValid = true;
        return;
      }
      JSON.parse(queryArgs);
      queryArgsValid = true;
    } catch (error) {
      queryArgsValid = false;
    }
  };

  $: {
    queryType && queryArgsValid && query(queryType, queryArgs);
  }

  let jsonFormatting = true;
</script>

<section>
  {#await queryTypes}
    <div class="text-center">
      <Loading />
      <p>{translate('workflows.no-workers-failure-message')}</p>
    </div>
  {:then types}
    <div class="flex justify-between items-end gap">
      <div class="flex items-start gap-8">
        <div class="flex flex-col gap-1">
          <label for="query-select">
            {translate('workflows.query-type')}
          </label>
          <div class="flex items-center h-14">
          <Select
            id="query-select"
            bind:value={queryType}
            data-testid="query-select"
          >
            {#each types as value}
              <Option {value}>{value}</Option>
            {/each}
          </Select>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label for="query-args">
            {translate('workflows.query-args')}
          </label>
        <div class={`border-4 rounded-2xl min-w-96 ${queryArgsValid ? 'border-transparent' : 'border-red-700'}`}
             class:text-red-700={!queryArgsValid}>
          <CodeBlock
            editable
            inline={false}
            content={queryArgs}
            copyable={false}
            on:change={handleQueryArgsChange}
          />
        </div>
        </div>
      </div>
      <div class="flex justify-end items-center gap-8">
        <ToggleSwitch
          label={translate('workflows.json-formatting')}
          labelPosition="left"
          id="json-formatting"
          checked={jsonFormatting}
          on:change={() => (jsonFormatting = !jsonFormatting)}
        />
        <Button
          on:click={() => query(queryType, queryArgs)}
          leadingIcon="retry"
          loading={isLoading}
        >
          {translate('common.refresh')}
        </Button>

      </div>
    </div>

    {#if !queryArgsValid}
      <div class="mt-4">
        <EmptyState
          title={translate('workflows.invalid-query-args')}
          content={translate('workflows.invalid-query-args-message')}
        />
      </div>
      {:else}
    <div class="my-4 flex h-full items-start">
      {#await queryResult then result}
        {@const content =
          typeof result !== 'string' ? stringifyWithBigInt(result) : result}
        <CodeBlock
          {content}
          language={jsonFormatting ? 'json' : 'text'}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/await}
    </div>
    {/if}
{:catch _error}
    <EmptyState
      title={translate('common.error-occurred')}
      content={translate('workflows.no-workers-running-message')}
      error={_error?.body?.message}
    />
  {/await}
</section>
