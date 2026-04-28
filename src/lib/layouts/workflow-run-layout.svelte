<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, untrack } from 'svelte';

  import { page } from '$app/state';

  import WorkflowError from '$lib/components/workflow/workflow-error.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHeader from '$lib/layouts/workflow-header.svelte';
  import {
    fetchAllEvents,
    throttleRefresh,
  } from '$lib/services/events-service';
  import { getPollers } from '$lib/services/pollers-service';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
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
  import { decodeUserMetadata } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  interface Props {
    children: Snippet;
    headerSnippet?: Snippet;
  }

  let { children, headerSnippet = undefined }: Props = $props();

  let namespace = $derived(page.params.namespace);
  let workflowId = $derived(page.params.workflow);
  let runId = $derived(page.params.run);
  let showJson = $derived(page.url.searchParams.has('json'));
  let fullJson = $derived({ ...$workflowRun, eventHistory: $fullEventHistory });

  let workflowError: NetworkError | null = $state(null);
  let workflowRunController: AbortController;
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  const { copy, copied } = copyToClipboard();

  const handleCopy = (e: Event) => {
    copy(e, stringifyWithBigInt(fullJson));
  };

  const decodeWorkflowUserMetadata = async (workflow: WorkflowExecution) => {
    const userMetadata = { summary: '', details: '' };
    try {
      if (workflow?.summary) {
        const decodedSummary = await decodeUserMetadata(workflow.summary);
        if (typeof decodedSummary === 'string') {
          userMetadata.summary = decodedSummary;
        }
      }
      if (workflow?.details) {
        const decodedDetails = await decodeUserMetadata(workflow.details);
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
    const { settings } = page.data;
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

    await decodeWorkflowUserMetadata(workflow);

    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue!, namespace });

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
      $workflowRun.workflow = workflow ?? null;
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
    workflowError = null;
    abortPolling();
    resetLastDataEncoderSuccess();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = null;
  };

  $effect(() => {
    runId;
    untrack(() => {
      clearWorkflowData();
    });
  });

  $effect(() => {
    const ns = namespace;
    const wfId = workflowId;
    const rId = runId;
    untrack(() => {
      getWorkflowAndEventHistory(ns, wfId, rId);
    });
  });

  $effect(() => {
    const refreshValue = $refresh;
    const pause = $pauseLiveUpdates;
    untrack(() => {
      getOnlyWorkflowWithPendingActivities(refreshValue, pause);
    });
  });

  $effect(() => {
    if (!$pauseLiveUpdates) {
      $currentEventHistory = $fullEventHistory;
    }
  });

  onMount(() => {
    const sort = page.url.searchParams.get('sort');
    if (sort) $eventFilterSort = sort as EventSortOrder;
    refreshInterval = setInterval(() => {
      throttleRefresh();
    }, 10000);

    return () => {
      clearWorkflowData();
    };
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
    {stringifyWithBigInt(fullJson, undefined, 2)}
  </div>
{:else if workflowError}
  <WorkflowError error={workflowError} />
{:else if !$workflowRun.workflow}
  <SkeletonWorkflow />
{:else}
  <WorkflowHeader {headerSnippet} />
  {@render children()}
{/if}
