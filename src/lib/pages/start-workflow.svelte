<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { onMount } from 'svelte';
  import { v4 } from 'uuid';

  import { page } from '$app/stores';

  import PayloadInputWithEncoding, {
    type PayloadInputEncoding,
  } from '$lib/components/payload-input-with-encoding.svelte';
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Editor from '$lib/holocene/monaco/editor.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getPollers } from '$lib/services/pollers-service';
  import {
    fetchInitialValuesForStartWorkflow,
    startWorkflow,
  } from '$lib/services/workflow-service';
  import {
    customSearchAttributes,
    type SearchAttributeInput,
  } from '$lib/stores/search-attributes';
  import { toaster } from '$lib/stores/toaster';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { pluralize } from '$lib/utilities/pluralize';
  import {
    routeForEventHistory,
    routeForTaskQueue,
    routeForWorkflows,
  } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';

  $: ({ namespace } = $page.params);

  let workflowId = '';
  let taskQueue = '';
  let workflowType = '';
  let input = '';
  let summary = '';
  let details = '';
  let encoding: Writable<PayloadInputEncoding> = writable('json/plain');
  let messageType = '';
  let inputRetrieved = 0;

  let initialWorkflowId = '';
  let initialWorkflowType = '';

  let error = '';
  let pollerCount: undefined | number = undefined;
  let viewAdvancedOptions = false;

  let searchAttributes: SearchAttributeInput[] = [];

  $: taskQueueParam = $page.url.searchParams.get('taskQueue');

  onMount(() => {
    workflowId = $page.url.searchParams.get('workflowId') || '';
    taskQueue = $page.url.searchParams.get('taskQueue') || '';
    workflowType = $page.url.searchParams.get('workflowType') || '';
    initialWorkflowId = $page.url.searchParams.get('workflowId') || '';
    initialWorkflowType = $page.url.searchParams.get('workflowType') || '';

    if (initialWorkflowId || initialWorkflowType) {
      getInitialValues(initialWorkflowId, initialWorkflowType);
    }
  });

  const onWorkflowStart = async () => {
    try {
      error = '';
      const { runId } = await startWorkflow({
        namespace,
        workflowId,
        taskQueue,
        workflowType,
        input,
        summary,
        details,
        encoding: $encoding,
        messageType,
        searchAttributes,
      });
      toaster.push({
        variant: 'success',
        duration: 5000,
        message: translate('workflows.start-workflow-success'),
        link: routeForEventHistory({
          namespace,
          workflow: workflowId,
          run: runId,
        }),
      });
    } catch (e) {
      error = e?.message || translate('workflows.start-workflow-error');
      toaster.push({
        variant: 'error',
        message: translate('workflows.start-workflow-error'),
      });
    }
  };

  const generateRandomWorkflowId = () => {
    workflowId = v4();
    updateQueryParameters({
      parameter: 'workflowId',
      value: workflowId,
      url: $page.url,
      allowEmpty: true,
      options: { keepFocus: true, noScroll: true, replaceState: true },
    });
  };

  const checkTaskQueue = async (queue: string) => {
    if (queue) {
      const { pollers } = await getPollers({ namespace, queue });
      pollerCount = pollers.length;
    }
  };

  const getInitialValues = async (id: string, type: string) => {
    const initialValues = await fetchInitialValuesForStartWorkflow({
      namespace,
      workflowId: id,
      workflowType: type,
    });
    input = initialValues.input;
    inputRetrieved = Date.now();
    summary = initialValues.summary;
    details = initialValues.details;

    if (initialValues?.searchAttributes) {
      const customSAKeys = Object.keys($customSearchAttributes);
      Object.entries(initialValues.searchAttributes).forEach(([key, value]) => {
        if (customSAKeys.includes(key)) {
          searchAttributes = [
            ...searchAttributes,
            {
              label: key,
              value,
              type: $customSearchAttributes[key],
            } as SearchAttributeInput,
          ];
        }
      });
    }

    if (
      Object.keys(initialValues?.searchAttributes ?? {}).length ||
      initialValues?.summary ||
      initialValues?.details
    ) {
      viewAdvancedOptions = true;
    }
  };

  const onInputChange = (e: Event, parameter: string) => {
    const value = (e.target as HTMLInputElement).value;
    updateQueryParameters({
      parameter,
      value,
      url: $page.url,
      allowEmpty: true,
      options: { keepFocus: true, noScroll: true, replaceState: true },
    });
  };

  const inputIsJSON = (input: string) => {
    try {
      JSON.parse(input);
      return true;
    } catch (e) {
      return false;
    }
  };

  $: inputValid = !input || inputIsJSON(input);

  $: enableStart =
    !!workflowId &&
    !!taskQueue &&
    !!workflowType &&
    !!inputValid &&
    !workflowCreateDisabled($page);

  $: checkTaskQueue(taskQueueParam);
</script>

<div class="flex w-full flex-col gap-4 pb-20">
  <Link
    href={`${routeForWorkflows({
      namespace,
    })}?${$workflowsSearchParams}`}
    data-testid="back-to-workflows"
    icon="chevron-left"
  >
    {translate('workflows.back-to-workflows')}
  </Link>
  <h1 class="mb-4 overflow-hidden" data-testid="start-workflow">
    Start a Workflow
  </h1>
  <Card class="flex w-full flex-col gap-4 xl:w-3/4 2xl:w-1/2">
    <div
      class="flex w-full flex-col justify-between gap-2 sm:items-center md:flex-row md:gap-4"
    >
      <Input
        id="workflowId"
        required
        bind:value={workflowId}
        label="Workflow ID"
        class="w-full grow"
        on:blur={(e) => onInputChange(e, 'workflowId')}
      />
      <Button
        class="mt-0 md:mt-6"
        variant="secondary"
        leadingIcon="retry"
        on:click={generateRandomWorkflowId}>Random UUID</Button
      >
    </div>
    <div class="flex w-full items-center justify-between gap-4">
      <Input
        id="taskQueue"
        required
        bind:value={taskQueue}
        label="Task Queue"
        class="grow"
        on:blur={(e) => onInputChange(e, 'taskQueue')}
      />
    </div>
    {#if pollerCount !== undefined}
      <Alert
        intent={pollerCount > 0 ? 'success' : 'warning'}
        title={pollerCount ? 'Task Queue is Active' : 'Task Queue is Inactive'}
      >
        <div class="flex w-full items-center justify-between">
          <p>
            {pollerCount}
            {pluralize('Worker', pollerCount)}
          </p>
          <Link
            href={routeForTaskQueue({ namespace, queue: taskQueue })}
            newTab
          >
            View Task Queue
          </Link>
        </div></Alert
      >
    {/if}
    <Input
      id="workflowType"
      required
      bind:value={workflowType}
      label="Workflow Type"
      on:blur={(e) => onInputChange(e, 'workflowType')}
    />
    {#key inputRetrieved}
      <PayloadInputWithEncoding bind:input bind:encoding bind:messageType />
    {/key}
    {#if viewAdvancedOptions}
      <Card class="flex flex-col gap-2">
        <div class="flex flex-wrap justify-between">
          <h3>{translate('workflows.user-metadata')}</h3>
          <p class="flex items-center gap-1 text-sm text-subtle">
            {translate('workflows.markdown-supported')}
            <Tooltip
              topRight
              width={200}
              text={translate('workflows.markdown-description')}
            >
              <Icon name="info" /></Tooltip
            >
          </p>
        </div>
        <Label label={translate('workflows.summary')} for="summary" />
        <Editor
          content={summary}
          on:change={(event) => (summary = event.detail.value)}
          class="min-h-48"
        />
        <Label label={translate('workflows.details')} for="details" />
        <Editor
          content={details}
          on:change={(event) => (details = event.detail.value)}
        />
      </Card>
      <AddSearchAttributes bind:attributesToAdd={searchAttributes} />
    {/if}
    <div
      class="mt-4 flex w-full flex-row justify-between gap-4 max-sm:flex-col"
    >
      <Button
        variant="ghost"
        class="max-sm:w-full"
        trailingIcon={viewAdvancedOptions ? 'chevron-up' : 'chevron-down'}
        on:click={() => (viewAdvancedOptions = !viewAdvancedOptions)}
        >{translate('common.more-options')}</Button
      >
      <Button
        disabled={!enableStart}
        on:click={onWorkflowStart}
        data-testid="start-workflow-button"
        class="max-sm:w-full">{translate('workflows.start-workflow')}</Button
      >
    </div>
    {#if error}
      <Alert intent="error" title={error} />
    {/if}
  </Card>
</div>
