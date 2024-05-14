<script lang="ts">
  import { uuid4 } from '@temporalio/workflow';
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getPollers } from '$lib/services/pollers-service';
  import { startWorkflow } from '$lib/services/workflow-service';
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

  let error = '';
  let pollerCount: undefined | number = undefined;
  let viewAdvancedOptions = false;

  let searchAttributes = '';

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

  const onInputChange = (e: Event, parameter: string) => {
    const value = (e.target as HTMLInputElement).value;
    updateQueryParameters({
      parameter,
      value,
      url: $page.url,
      allowEmpty: true,
    });
  };

  $: enableStart = !!workflowId && !!taskQueue && !!workflowType;
</script>

<div class="flex w-full flex-col items-center">
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
        on:input={(e) => onInputChange(e, 'workflowId')}
      />
      <Button
        class="mt-5"
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
        on:input={(e) => onInputChange(e, 'taskQueue')}
      />
      <Button
        class="mt-5"
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
      on:input={(e) => onInputChange(e, 'workflowType')}
    />
    <Label for="schedule-input" label={translate('workflows.input')} />
    <CodeBlock
      id="workflow-input"
      maxHeight={320}
      content={input}
      on:change={handleInputChange}
      editable
      copyable={false}
    />
    <div class="mt-4 flex w-full justify-between">
      <Button
        variant="ghost"
        disabled={!enableStart}
        on:click={() => (viewAdvancedOptions = !viewAdvancedOptions)}
        >Advanced Options</Button
      >
      <Button disabled={!enableStart} on:click={onWorkflowStart}
        >Start Workflow</Button
      >
    </div>
    {#if error}
      <Alert intent="error" title={error} />
    {/if}
    {#if viewAdvancedOptions}
      <Input
        id="searchAttributes"
        bind:value={searchAttributes}
        label="Search Attributes"
        on:input={(e) => onInputChange(e, 'searchAttributes')}
      />
    {/if}
  </div>
</div>
