<script lang="ts">
  import { onMount } from 'svelte';

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
    getWorkflowMetadata,
    type ParsedQuery,
  } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { Payloads } from '$lib/types';
  import { encodePayloads } from '$lib/utilities/encode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  const params = {
    id: workflowId,
    runId,
  };

  let queryType: string;
  let initialQueryType: string;
  let input = '';
  let initialInput = '';
  let loading = false;
  let jsonFormatting = true;

  $: edited = initialQueryType !== queryType || input !== initialInput;

  $: metadataError = $workflowRun.metadata?.error?.message;
  $: queryTypes =
    $workflowRun?.metadata?.definition?.queryDefinitions?.filter((query) => {
      return query?.name !== '__stack_trace';
    }) || [];

  $: queryType = queryType || queryTypes?.[0]?.name;

  let queryResult: Promise<ParsedQuery>;
  let encodePayloadResult: Promise<Payloads>;

  onMount(() => {
    if (!$workflowRun?.metadata) {
      fetchCurrentDetails();
    }
  });

  const fetchCurrentDetails = async () => {
    const { settings } = $page.data;
    const metadata = await getWorkflowMetadata(
      {
        namespace,
        workflow: {
          id: workflowId,
          runId: runId,
        },
      },
      settings,
      $authUser?.accessToken,
    );
    $workflowRun.metadata = metadata;
    if (!metadata.currentDetails) {
      $workflowRun.metadata.currentDetails = translate(
        'workflows.no-current-details',
      );
    }
  };

  const reset = () => {
    loading = false;
    initialQueryType = queryType;
    initialInput = input;
  };

  const query = async (queryType: string) => {
    loading = true;
    let payloads;

    try {
      encodePayloadResult = input
        ? encodePayloads(input, 'json/plain', false)
        : Promise.resolve(null);
      payloads = await encodePayloadResult;
    } catch (e) {
      reset();
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
      reset();
    });
  };
</script>

<section>
  {#if metadataError}
    <EmptyState
      title={translate('common.error-occurred')}
      content={translate('workflows.no-workers-running-message')}
      error={$workflowRun.metadata?.error?.message}
    />
  {:else if !queryTypes.length}
    <div class="text-center">
      <Loading />
      <p class="-mt-10">{translate('workflows.no-workers-failure-message')}</p>
    </div>
  {:else}
    <div class="flex w-3/4 gap-4 max-2xl:w-full max-lg:flex-col">
      <Card class="mt-7 flex h-fit w-full flex-col gap-2">
        <Select
          id="query-select"
          label={translate('workflows.query-type')}
          class="min-w-fit"
          bind:value={queryType}
          data-testid="query-select"
          required
        >
          {#each queryTypes as { name: value, description = '' }}
            <Option {value} {description}>{value}</Option>
          {/each}
        </Select>
        <div class="flex flex-col gap-1">
          <PayloadInput bind:input label={translate('workflows.query-arg')} />
        </div>
        <div class="flex w-full flex-wrap items-end justify-end gap-4">
          <Button
            on:click={() => query(queryType)}
            {loading}
            variant={edited ? 'primary' : 'secondary'}
            leadingIcon={edited ? null : 'retry'}
            disabled={loading}
          >
            {edited
              ? translate('workflows.run-query')
              : translate('workflows.refresh-query')}
          </Button>
        </div>
      </Card>
      <div class="flex w-full flex-col gap-2">
        {#await Promise.all( [queryResult, encodePayloadResult], ) then [result, _]}
          {@const content =
            typeof result !== 'string' ? stringifyWithBigInt(result) : result}
          <div class="ml-auto">
            <ToggleSwitch
              label={translate('workflows.json-formatting')}
              labelPosition="left"
              id="json-formatting"
              checked={jsonFormatting}
              on:change={() => (jsonFormatting = !jsonFormatting)}
            />
          </div>
          <CodeBlock
            {content}
            language={jsonFormatting ? 'json' : 'text'}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            testId="query-result"
            class={edited && 'opacity-50'}
          />
        {:catch _error}
          <EmptyState
            title={translate('common.error-occurred')}
            error={_error?.message}
          />
        {/await}
      </div>
    </div>
  {/if}
</section>
