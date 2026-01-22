<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import PayloadInputWithEncoding from '$lib/components/payload-input-with-encoding.svelte';
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
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
  import { getIdentity } from '$lib/utilities/core-context';
  import {
    formatSecondsAbbreviated,
    fromNumberToDuration,
  } from '$lib/utilities/format-time';
  import { pluralize } from '$lib/utilities/pluralize';
  import {
    routeForTaskQueue,
    routeForTimeline,
    routeForWorkflows,
  } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';

  $: ({ namespace } = $page.params);

  const identity = getIdentity();

  let workflowId = '';
  let taskQueue = '';
  let workflowType = '';
  let input = '';
  let summary = '';
  let details = '';
  let encoding: Writable<PayloadInputEncoding> = writable('json/plain');
  let messageType = '';
  let workflowStartDelay = '';

  let initialRunId = '';
  let initialWorkflowId = '';
  let initialWorkflowType = '';

  let error = '';
  let pollerCount: undefined | number = undefined;
  let viewAdvancedOptions = false;

  let searchAttributes: SearchAttributeInput[] = [];

  $: errorWorkflowDetails = extractWorkflowFromError(error);

  function extractWorkflowFromError(errorMessage: string): {
    workflowId?: string;
    runId?: string;
  } {
    if (!errorMessage) return {};

    const match = errorMessage.match(/WorkflowId: (.+?), RunId: (.+?)\.?$/);
    if (!match) return {};

    const workflowId = match[1]?.trim();
    const runId = match[2]?.trim();

    if (!workflowId || !runId) return {};

    return {
      workflowId,
      runId,
    };
  }

  $: taskQueueParam = $page.url.searchParams.get('taskQueue');

  onMount(() => {
    workflowId = $page.url.searchParams.get('workflowId') || '';
    taskQueue = $page.url.searchParams.get('taskQueue') || '';
    workflowType = $page.url.searchParams.get('workflowType') || '';
    initialRunId = $page.url.searchParams.get('runId') || '';
    initialWorkflowId = $page.url.searchParams.get('workflowId') || '';
    initialWorkflowType = $page.url.searchParams.get('workflowType') || '';

    if (initialWorkflowId || initialWorkflowType || initialRunId) {
      getInitialValues({
        runId: initialRunId,
        workflowId: initialWorkflowId,
        workflowType: initialWorkflowType,
      });
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
        identity,
        workflowStartDelay: fromNumberToDuration(workflowStartDelay),
      });
      toaster.push({
        variant: 'success',
        duration: 5000,
        message: translate('workflows.start-workflow-success'),
        link: routeForTimeline({
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
    workflowId = crypto.randomUUID();
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

  const getInitialValues = async ({
    runId,
    workflowId,
    workflowType,
  }: {
    runId: string;
    workflowId: string;
    workflowType: string;
  }) => {
    const initialValues = await fetchInitialValuesForStartWorkflow({
      namespace,
      runId,
      workflowId,
      workflowType,
    });
    input = initialValues.input;
    encoding.set(initialValues.encoding);
    messageType = initialValues.messageType;
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
    } catch {
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
    Start Workflow
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
    <PayloadInputWithEncoding bind:input bind:encoding bind:messageType />
    {#if viewAdvancedOptions}
      <Card class="flex flex-col gap-2">
        <div>
          <h3>{translate('search-attributes.custom-search-attributes')}</h3>
          <p class="text-xs text-secondary">
            Indexed fields used in a List Filter to filter a list of Workflow
            Executions.
          </p>
        </div>
        <AddSearchAttributes
          bind:attributesToAdd={searchAttributes}
          buttonCopy={translate('common.add')}
          variant="secondary"
        />
      </Card>
      <Card class="flex flex-col gap-2">
        <div>
          <Label
            for="workflow-start-delay"
            label={translate('workflows.workflow-start-delay')}
            class="text-xl"
          />
          <p class="text-xs text-secondary">
            Time to wait before dispatching the first workflow task.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Input
            id="workflow-start-delay"
            label={translate('workflows.workflow-start-delay')}
            labelHidden
            bind:value={workflowStartDelay}
            suffix="sec"
            class="w-36"
            error={isNaN(Number(workflowStartDelay))}
          />
          <p class="text-nowrap text-secondary">
            {formatSecondsAbbreviated(workflowStartDelay)}
          </p>
        </div>
      </Card>
      <Card class="flex flex-col gap-2">
        <div class="flex flex-wrap justify-between">
          <div>
            <h3>{translate('workflows.user-metadata')}</h3>
            <p class="text-xs text-secondary">
              Add context to Workflow Execution to help identity and understand
              its operations.
            </p>
          </div>
          <p class="flex items-center gap-1 text-sm text-secondary">
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
        <MarkdownEditor bind:content={summary} />
        <Label label={translate('workflows.details')} for="details" />
        <MarkdownEditor bind:content={details} />
      </Card>
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
      <Alert intent="error" title={error}>
        {#if errorWorkflowDetails.workflowId && errorWorkflowDetails.runId}
          <div class="mt-2">
            <Link
              href={routeForTimeline({
                namespace,
                workflow: errorWorkflowDetails.workflowId,
                run: errorWorkflowDetails.runId,
              })}
              class="inline-flex items-center gap-1"
            >
              <Icon name="external-link" class="h-4 w-4" />
              {translate('workflows.view-running-workflow')}
            </Link>
          </div>
        {/if}
      </Alert>
    {/if}
    <CodecServerErrorBanner />
  </Card>
</div>
