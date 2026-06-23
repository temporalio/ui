<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, setContext, untrack } from 'svelte';

  import { page } from '$app/state';

  import WorkflowError from '$lib/components/workflow/workflow-error.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHeader from '$lib/layouts/workflow-header.svelte';
  import { throttleRefresh } from '$lib/services/events-service';
  import type { PauseHandle } from '$lib/services/fetch-bidirectional';
  import { fetchBidirectional } from '$lib/services/fetch-bidirectional';
  import {
    appendLiveEvent,
    enrichGroups,
    getEventArray,
    processEvent,
    reset as resetBuffer,
  } from '$lib/services/grouped-event-buffer';
  import { getPollers } from '$lib/services/pollers-service';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { resetLastDataEncoderSuccess } from '$lib/stores/data-encoder-config';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';
  import {
    bufferVersion,
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
  import type {
    GetWorkflowExecutionHistoryResponse,
    HistoryEvent,
  } from '$lib/types/events';
  import type { NetworkError } from '$lib/types/global';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { routeForApi } from '$lib/utilities/route-for-api';

  interface Props {
    children: Snippet;
    headerSnippet?: Snippet;
  }

  let { children, headerSnippet = undefined }: Props = $props();

  let namespace = $derived(page.params.namespace);
  let workflowId = $derived(page.params.workflow);
  let runId = $derived(page.params.run);
  let showJson = $derived(page.url.searchParams.has('json'));
  let fullJson = $derived.by(() => {
    $bufferVersion;
    return { ...$workflowRun, eventHistory: getEventArray() };
  });

  let workflowError: NetworkError | null = $state(null);
  let workflowRunController: AbortController;
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  let livePollingController: AbortController | null = null;

  let fetchComplete = $state(false);
  let latestEventId = $state(0);
  let totalExpectedEvents = $state(0);
  let descMinId = $state(0);

  let _pauseHandle: PauseHandle | null = null;
  let _resumeRequested = false;

  const ctx: HistoryContext = {
    get fetchComplete() {
      return fetchComplete;
    },
    get latestEventId() {
      return latestEventId;
    },
    get totalExpectedEvents() {
      return totalExpectedEvents;
    },
    get descMinId() {
      return descMinId;
    },
    resume() {
      if (_pauseHandle) {
        const h = _pauseHandle;
        _pauseHandle = null;
        _resumeRequested = false;
        h.resume();
      } else {
        _resumeRequested = true;
      }
    },
  };

  setContext(HISTORY_CTX, ctx);

  const { copy, copied } = copyToClipboard();

  const handleCopy = (e: Event) => {
    copy(e, stringifyWithBigInt(fullJson));
  };

  const decodeWorkflowUserMetadata = async (workflow: WorkflowExecution) => {
    const userMetadata = { summary: '', details: '' };
    try {
      if (workflow?.summary) {
        const decodedSummary = await decodePayloadAndParseDataToJSON(
          workflow.summary,
        );
        if (typeof decodedSummary === 'string') {
          userMetadata.summary = decodedSummary;
        }
      }
      if (workflow?.details) {
        const decodedDetails = await decodePayloadAndParseDataToJSON(
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

  const startLivePoll = (
    ns: string,
    wfId: string,
    rId: string,
    fromEventId: number,
  ) => {
    livePollingController?.abort();
    livePollingController = new AbortController();
    const signal = livePollingController.signal;
    const route = routeForApi('events.ascending', {
      namespace: ns,
      workflowId: wfId,
    });

    (async () => {
      let nextEventId = fromEventId + 1;
      while (!signal.aborted) {
        try {
          const response =
            await requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
              request: fetch,
              params: {
                'execution.runId': rId,
                waitNewEvent: 'true',
                firstEventId: String(nextEventId),
              },
              options: { signal },
            });
          const events = (response?.history?.events ?? []) as HistoryEvent[];
          for (const ev of events) {
            appendLiveEvent(ev);
            const id = parseInt(ev.eventId);
            if (id >= nextEventId) nextEventId = id + 1;
            latestEventId = id;
          }
          if (events.length) bufferVersion.update((v) => v + 1);
          if (!response.nextPageToken) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        } catch {
          if (!signal.aborted) {
            await new Promise((r) => setTimeout(r, 5000));
          }
        }
      }
    })();
  };

  const getWorkflowAndEventHistory = async (
    ns: string,
    wfId: string,
    rId: string,
  ) => {
    const { workflow, error } = await fetchWorkflow({
      namespace: ns,
      workflowId: wfId,
      runId: rId,
    });

    if (error) {
      workflowError = error;
      return;
    }

    if (!workflow) return;

    await decodeWorkflowUserMetadata(workflow);

    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue!, namespace: ns });

    $workflowRun = { ...$workflowRun, workflow, workers, workersLoaded: true };

    workflowRunController = new AbortController();

    if (workflow.isRunning && workers?.pollers?.length) {
      getWorkflowMetadata(
        { namespace: ns, workflow: { id: wfId, runId: rId } },
        workflowRunController.signal,
      ).then((metadata) => {
        $workflowRun.metadata = metadata;
      });
    }

    const historySize = parseInt(workflow.historyEvents ?? '0') || 0;
    resetBuffer(historySize);
    fetchComplete = false;
    _pauseHandle = null;

    fetchBidirectional({
      namespace: ns,
      workflowId: wfId,
      runId: rId,
      signal: workflowRunController.signal,
      maximumPageSize: 1000,
      pauseAfterPages: 2,
      onProgress: (p) => {
        if (p.totalEstimated) totalExpectedEvents = p.totalEstimated;
        if (p.descMinId) descMinId = p.descMinId;
      },
      onPause: (handle) => {
        if (_resumeRequested) {
          _resumeRequested = false;
          handle.resume();
        } else {
          _pauseHandle = handle;
        }
      },
      onRawPage: (events, isAscending) => {
        for (const event of events) {
          processEvent(event, isAscending);
          const id = parseInt(event.eventId);
          if (id > latestEventId) latestEventId = id;
        }
        if (events.length) bufferVersion.update((v) => v + 1);
      },
    })
      .then(() => {
        enrichGroups(
          $workflowRun.workflow?.pendingActivities ?? [],
          $workflowRun.workflow?.pendingNexusOperations ?? [],
        );
        fetchComplete = true;
        bufferVersion.update((v) => v + 1);

        if (workflow.isRunning) {
          startLivePoll(ns, wfId, rId, latestEventId);
        }
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name !== 'AbortError') {
          workflowError = { message: e.message } as NetworkError;
        }
      });
  };

  const getOnlyWorkflowWithPendingActivities = async (
    refreshAction: RefreshAction,
    pause: boolean,
  ) => {
    const shouldFetch =
      refreshAction.timestamp &&
      (refreshAction.action || (!pause && $workflowRun?.workflow?.isRunning));

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

  const abortAll = () => {
    if (workflowRunController) workflowRunController.abort();
    livePollingController?.abort();
    livePollingController = null;
  };

  $effect(() => {
    $bufferVersion;
    untrack(() => {
      const events = getEventArray();
      $fullEventHistory = events;
      if (!$pauseLiveUpdates) $currentEventHistory = events;
    });
  });

  const clearWorkflowData = () => {
    $timelineEvents = null;
    $workflowRun = initialWorkflowRun;
    $fullEventHistory = [];
    $currentEventHistory = [];
    $bufferVersion = 0;
    workflowError = null;
    fetchComplete = false;
    latestEventId = 0;
    totalExpectedEvents = 0;
    descMinId = 0;
    _pauseHandle = null;
    _resumeRequested = false;
    abortAll();
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
