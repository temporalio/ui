<script lang="ts">
  import { uuid4 } from '@temporalio/workflow';
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import StartWorkflowInputUpload from '$lib/components/workflow/start-workflow-input-upload.svelte';
  import StartWorkflowSearchAttributes from '$lib/components/workflow/start-workflow-search-attributes.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Link from '$lib/holocene/link.svelte';
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
  import { pluralize } from '$lib/utilities/pluralize';
  import {
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
  let inputRetrieved = 0;

  let initialWorkflowId = '';
  let initialWorkflowType = '';
  let initialInput = '';

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

  const handleInputChange = (event: CustomEvent<string>) => {
    input = event.detail;
  };

  const onWorkflowStart = async () => {
    try {
      error = '';
      await startWorkflow({
        namespace,
        workflowId,
        taskQueue,
        workflowType,
        input,
        searchAttributes,
      });
      goto(routeForWorkflows({ namespace }));
    } catch (e) {
      error = e?.message || 'Error start Workflow';
    }
  };

  const generateRandomWorkflowId = () => {
    workflowId = uuid4();
    updateQueryParameters({
      parameter: 'workflowId',
      value: workflowId,
      url: $page.url,
      allowEmpty: true,
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
    initialInput = initialValues.input;
    input = initialInput;
    inputRetrieved = Date.now();
    if (initialValues?.searchAttributes) {
      const customSAKeys = Object.keys($customSearchAttributes);
      Object.entries(initialValues.searchAttributes).forEach(([key, value]) => {
        if (customSAKeys.includes(key)) {
          searchAttributes = [
            ...searchAttributes,
            { attribute: key, value: String(value) },
          ];
        }
      });
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
    });
  };

  const onInputUpload = (uploadInput: string) => {
    input = uploadInput;
    inputRetrieved = Date.now();
  };

  $: createDisabled = workflowCreateDisabled($page);
  $: enableStart =
    !!workflowId && !!taskQueue && !!workflowType && !createDisabled;

  $: checkTaskQueue(taskQueueParam);
</script>

<div class="flex w-full flex-col items-center pb-24">
  <div class="flex w-full flex-col gap-4 lg:w-2/3 2xl:w-1/2">
    <h1 class="mb-4 overflow-hidden text-base font-medium lg:text-2xl">
      Start a Workflow
    </h1>
    <div
      class="flex w-full flex-col items-center justify-between gap-2 md:flex-row md:gap-4"
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
    <div
      class="flex w-full flex-col items-end justify-between gap-4 md:flex-row"
    >
      {#if initialInput}
        <div class="flex w-full flex-col gap-2 md:w-1/2">
          <Label
            class="text-subtle"
            for="workflow-example-input"
            label={translate('workflows.example-input')}
          />
          <CodeBlock
            id="workflow-initial-input"
            minHeight={120}
            content={initialInput}
            copyable
          />
        </div>
      {/if}
      <div class="flex w-full flex-col gap-2 {initialInput && 'md:w-1/2'}">
        <div class="flex w-full items-end justify-between">
          <Label for="workflow-input" label={translate('workflows.input')} />
          <StartWorkflowInputUpload onUpload={onInputUpload} />
        </div>
        {#key inputRetrieved}
          <CodeBlock
            id="workflow-input"
            minHeight={120}
            content={input}
            on:change={handleInputChange}
            editable
            copyable={false}
          />
        {/key}
      </div>
    </div>
    {#if viewAdvancedOptions}
      <StartWorkflowSearchAttributes bind:attributesToAdd={searchAttributes} />
    {/if}
    <div class="mt-4 flex w-full justify-between">
      <Button
        variant="ghost"
        trailingIcon={viewAdvancedOptions ? 'chevron-up' : 'chevron-down'}
        on:click={() => (viewAdvancedOptions = !viewAdvancedOptions)}
        >{translate('common.more-options')}</Button
      >
      <Button disabled={!enableStart} on:click={onWorkflowStart}
        >{translate('workflows.start-workflow')}</Button
      >
    </div>
    {#if error}
      <Alert intent="error" title={error} />
    {/if}
  </div>
</div>
