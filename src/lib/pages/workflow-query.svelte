<script lang="ts">
  import { page } from '$app/stores';

  import PayloadInput from '$lib/components/payload-input.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    getQuery,
    getQueryTypes,
    type ParsedQuery,
  } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import type { Payloads } from '$lib/types';
  import { encodePayloads } from '$lib/utilities/encode-payload';
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
    query(queryType);
    return queryTypes;
  });

  let queryResult: Promise<ParsedQuery>;
  let encodePayloadResult: Promise<Payloads>;

  const query = async (queryType: string) => {
    isLoading = true;
    let payloads;

    try {
      encodePayloadResult = input
        ? encodePayloads(input, 'json/plain', false)
        : Promise.resolve(null);
      payloads = await encodePayloadResult;
    } catch (e) {
      isLoading = false;
      return;
    }

    queryResult = getQuery(
      {
        namespace,
        workflow: params,
        queryType,
        queryArgs: payloads ? { payloads } : null,
      },
      $page.data?.settings,
      $authUser?.accessToken,
    ).finally(() => {
      isLoading = false;
    });
  };

  let input = '';
  let jsonFormatting = true;
</script>

<section>
  {#await queryTypes}
    <div class="text-center">
      <Loading />
      <p>{translate('workflows.no-workers-failure-message')}</p>
    </div>
  {:then types}
    <div class="flex items-end justify-between gap-2 max-sm:flex-wrap">
      <Card class="flex w-full flex-col gap-2 xl:w-2/3">
        <div class="flex flex-col gap-1">
          <PayloadInput bind:input label={translate('workflows.query-arg')} />
        </div>
        <div class="flex flex-wrap items-end gap-4">
          <Select
            id="query-select"
            label={translate('workflows.query-type')}
            bind:value={queryType}
            data-testid="query-select"
          >
            {#each types as value}
              <Option {value}>{value}</Option>
            {/each}
          </Select>
          <Button
            on:click={() => query(queryType)}
            leadingIcon="retry"
            loading={isLoading}
          >
            {translate('common.query')}
          </Button>
        </div>
      </Card>
      <div class="flex justify-end">
        <ToggleSwitch
          label={translate('workflows.json-formatting')}
          labelPosition="left"
          id="json-formatting"
          checked={jsonFormatting}
          on:change={() => (jsonFormatting = !jsonFormatting)}
        />
      </div>
    </div>
    <div class="my-2 flex h-full items-start">
      {#await Promise.all([queryResult, encodePayloadResult]) then [result, _]}
        {@const content =
          typeof result !== 'string' ? stringifyWithBigInt(result) : result}
        <CodeBlock
          {content}
          language={jsonFormatting ? 'json' : 'text'}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          testId="query-result"
        />
      {:catch _error}
        <EmptyState
          title={translate('common.error-occurred')}
          error={_error?.message}
        />
      {/await}
    </div>
  {:catch _error}
    <EmptyState
      title={translate('common.error-occurred')}
      content={translate('workflows.no-workers-running-message')}
      error={_error?.body?.message}
    />
  {/await}
</section>
