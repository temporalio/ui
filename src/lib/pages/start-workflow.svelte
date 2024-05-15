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
    fetchInputForStartWorkflow,
    startWorkflow,
  } from '$lib/services/workflow-service';
  import type { SearchAttributeInput } from '$lib/stores/search-attributes';
  import { pluralize } from '$lib/utilities/pluralize';
  import {
    routeForTaskQueue,
    routeForWorkflows,
  } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  $: ({ namespace } = $page.params);

  let workflowId = '';
  let taskQueue = '';
  let workflowType = '';
  let input = '';
  let inputRetrieved = 0;

  let error = '';
  let pollerCount: undefined | number = undefined;
  let viewAdvancedOptions = false;

  let searchAttributes: SearchAttributeInput[] = [];

  onMount(() => {
    workflowId = $page.url.searchParams.get('workflowId') || '';
    taskQueue = $page.url.searchParams.get('taskQueue') || '';
    workflowType = $page.url.searchParams.get('workflowType') || '';
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
      setTimeout(() => {
        goto(routeForWorkflows({ namespace }));
      }, 150);
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

  const checkTaskQueue = async () => {
    const { pollers } = await getPollers({ namespace, queue: taskQueue });
    pollerCount = pollers.length;
  };

  $: getPreviousInput = async () => {
    input = await fetchInputForStartWorkflow({
      namespace,
      workflowType,
      workflowId,
    });
    inputRetrieved = Date.now();
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

  $: enableStart = !!workflowId && !!taskQueue && !!workflowType;
</script>

<div class="flex w-full flex-col items-center pb-24">
  <div class="flex w-full flex-col gap-4 lg:w-2/3 2xl:w-1/2">
    <h1 class="mb-4 overflow-hidden text-base font-medium lg:text-2xl">
      Start a Workflow
    </h1>
    <div class="flex w-full items-center justify-between gap-4">
      <Input
        id="workflowId"
        required
        bind:value={workflowId}
        label="Workflow ID"
        class="grow"
        on:blur={(e) => onInputChange(e, 'workflowId')}
      />
      <Button
        class="mt-6"
        variant="secondary"
        on:click={generateRandomWorkflowId}>Generate</Button
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
      <Button
        class="mt-6"
        variant="secondary"
        disabled={!taskQueue}
        on:click={checkTaskQueue}>Check Status</Button
      >
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
    <div class="flex w-full items-end justify-between">
      <Label for="workflow-input" label={translate('workflows.input')} />
      <div class="flex items-center gap-2">
        <StartWorkflowInputUpload onUpload={onInputUpload} />
        <Button
          variant="secondary"
          disabled={!workflowType}
          on:click={getPreviousInput}>Previous Input</Button
        >
      </div>
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
    {#if viewAdvancedOptions}
      <StartWorkflowSearchAttributes bind:attributesToAdd={searchAttributes} />
    {/if}
    <div class="mt-4 flex w-full justify-between">
      <Button
        variant="ghost"
        trailingIcon={viewAdvancedOptions ? 'chevron-up' : 'chevron-down'}
        on:click={() => (viewAdvancedOptions = !viewAdvancedOptions)}
        >More options</Button
      >
      <Button disabled={!enableStart} on:click={onWorkflowStart}
        >Start Workflow</Button
      >
    </div>
    {#if error}
      <Alert intent="error" title={error} />
    {/if}
  </div>
</div>
