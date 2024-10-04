<script lang="ts">
  import { onMount } from 'svelte';
  import { v4 } from 'uuid';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PayloadInput from '$lib/components/payload-input.svelte';
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import FileInput from '$lib/holocene/file-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
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
  import { workflowsSearchParams } from '$lib/stores/workflows';
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
  let encoding = 'json/plain';
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
      await startWorkflow({
        namespace,
        workflowId,
        taskQueue,
        workflowType,
        input,
        encoding,
        searchAttributes,
      });
      goto(routeForWorkflows({ namespace }));
    } catch (e) {
      error = e?.message || 'Error start Workflow';
    }
  };

  const generateRandomWorkflowId = () => {
    workflowId = v4();
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
    input = initialValues.input;
    encoding = initialValues.encoding;
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

  const onUpload = (uploadInput: string) => {
    input = uploadInput;
    inputRetrieved = Date.now();
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

<div class="flex w-full flex-col items-center pb-24">
  <div class="mb-6 flex w-full items-start">
    <Link
      href={`${routeForWorkflows({
        namespace,
      })}?${$workflowsSearchParams}`}
      data-testid="back-to-workflows"
      icon="chevron-left"
    >
      {translate('workflows.back-to-workflows')}
    </Link>
  </div>
  <div class="flex w-full flex-col gap-4 lg:w-2/3 2xl:w-1/2">
    <h1 class="mb-4 overflow-hidden" data-testid="start-workflow">
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
    {#key inputRetrieved}
      <PayloadInput bind:input bind:encoding>
        <Tooltip text={translate('common.upload-json')} topRight>
          <FileInput id="start-workflow-input-file-upload" {onUpload} />
        </Tooltip>
      </PayloadInput>
    {/key}
    {#if viewAdvancedOptions}
      <AddSearchAttributes bind:attributesToAdd={searchAttributes} />
    {/if}
    <div class="mt-4 flex w-full justify-between">
      <Button
        variant="ghost"
        trailingIcon={viewAdvancedOptions ? 'chevron-up' : 'chevron-down'}
        on:click={() => (viewAdvancedOptions = !viewAdvancedOptions)}
        >{translate('common.more-options')}</Button
      >
      <Button
        disabled={!enableStart}
        on:click={onWorkflowStart}
        data-testid="start-workflow-button"
        >{translate('workflows.start-workflow')}</Button
      >
    </div>
    {#if error}
      <Alert intent="error" title={error} />
    {/if}
  </div>
</div>
