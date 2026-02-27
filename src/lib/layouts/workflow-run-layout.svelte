<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/stores';

  import WorkflowError from '$lib/components/workflow/workflow-error.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHeader from '$lib/layouts/workflow-header.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    fetchAllEvents,
    throttleRefresh,
  } from '$lib/services/events-service';
  import { getPollers } from '$lib/services/pollers-service';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { authUser } from '$lib/stores/auth-user';
  import { resetLastDataEncoderSuccess } from '$lib/stores/data-encoder-config';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    fullEventHistory,
    pauseLiveUpdates,
    timelineEvents,
  } from '$lib/stores/events';
  import {
    initialWorkflowRun,
    refresh,
    type RefreshAction,
    workflowRun,
  } from '$lib/stores/workflow-run';
  import type { NetworkError } from '$lib/types/global';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { decodeSingleReadablePayloadWithCodec } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: showJson = $page.url.searchParams.has('json');
  $: fullJson = { ...$workflowRun, eventHistory: $fullEventHistory };

  let workflowError: NetworkError | null = null;
  let workflowRunController: AbortController;
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  const { copy, copied } = copyToClipboard();

  const handleCopy = (e: Event) => {
    copy(e, stringifyWithBigInt(fullJson));
  };

  const decodeUserMetadata = async (workflow: WorkflowExecution) => {
    const userMetadata = { summary: '', details: '' };
    try {
      if (workflow?.summary) {
        const decodedSummary = await decodeSingleReadablePayloadWithCodec(
          workflow.summary,
        );
        if (typeof decodedSummary === 'string') {
          userMetadata.summary = decodedSummary;
        }
      }
      if (workflow?.details) {
        const decodedDetails = await decodeSingleReadablePayloadWithCodec(
          workflow.details,
        );
        if (typeof decodedDetails === 'string') {
          userMetadata.details = decodedDetails;
        }
      }

      $workflowRun = { ...$workflowRun, userMetadata };
    } catch (e) {
      console.error('Error decoding user metadata', e);
    }
  };

  const getWorkflowAndEventHistory = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    const { settings } = $page.data;
    const { workflow, error } = await fetchWorkflow({
      namespace,
      workflowId,
      runId,
    });

    if (error) {
      workflowError = error;
      return;
    }

    if (!workflow) {
      return;
    }

    await decodeUserMetadata(workflow);

    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue, namespace });

    $workflowRun = { ...$workflowRun, workflow, workers, workersLoaded: true };

    workflowRunController = new AbortController();

    if (workflow.isRunning && workers?.pollers?.length) {
      getWorkflowMetadata(
        {
          namespace,
          workflow: {
            id: workflowId,
            runId,
          },
        },
        settings,
        $authUser?.accessToken,
        workflowRunController.signal,
      ).then((metadata) => {
        $workflowRun.metadata = metadata;
      });
    }

    $fullEventHistory = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      sort: 'ascending',
      signal: workflowRunController.signal,
      historySize: workflow.historyEvents,
    });
  };

  const getOnlyWorkflowWithPendingActivities = async (
    refresh: RefreshAction,
    pause: boolean,
  ) => {
    const shouldFetch =
      refresh.timestamp &&
      (refresh.action || (!pause && $workflowRun?.workflow?.isRunning));

    if (shouldFetch) {
      const { workflow, error } = await fetchWorkflow({
        namespace,
        workflowId,
        runId,
      });
      if (error) {
        workflowError = error;
        return;
      }
      $workflowRun.workflow = workflow;
    }
  };

  const abortPolling = () => {
    $fullEventHistory = [];
    if (workflowRunController) {
      workflowRunController.abort();
    }
  };

  const clearWorkflowData = () => {
    $timelineEvents = null;
    $workflowRun = initialWorkflowRun;
    workflowError = undefined;
    abortPolling();
    resetLastDataEncoderSuccess();
    clearInterval(refreshInterval);
    refreshInterval = null;
  };

  $: (runId, clearWorkflowData());

  $: getWorkflowAndEventHistory(namespace, workflowId, runId);
  $: getOnlyWorkflowWithPendingActivities($refresh, $pauseLiveUpdates);

  const setCurrentEvents = (fullHistory, pause) => {
    if (!pause) {
      $currentEventHistory = fullHistory;
    }
  };

  $: setCurrentEvents($fullEventHistory, $pauseLiveUpdates);

  onMount(() => {
    const sort = $page.url.searchParams.get('sort');
    if (sort) $eventFilterSort = sort as EventSortOrder;
    refreshInterval = setInterval(() => {
      throttleRefresh();
    }, 10000);
  });

  onDestroy(() => {
    clearWorkflowData();
  });
</script>

{#if showJson}
  <div
    class="relative h-auto whitespace-break-spaces break-words bg-primary p-4"
  >
    <CopyButton
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      class="absolute right-1 top-1"
      on:click={handleCopy}
      copied={$copied}
    />
    {stringifyWithBigInt(fullJson, null, 2)}
  </div>
{:else if workflowError}
  <WorkflowError error={workflowError} />
{:else if !$workflowRun.workflow}
  <SkeletonWorkflow />
{:else}
  <WorkflowHeader />
  <slot />
{/if}
