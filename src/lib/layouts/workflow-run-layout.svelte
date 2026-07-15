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
  import { runLivePoll } from '$lib/services/live-poll';
  import { getPollers } from '$lib/services/pollers-service';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { resetLastDataEncoderSuccess } from '$lib/stores/data-encoder-config';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';
  import {
    bufferVersion,
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
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
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
  let fetchStartedAt = $state(0);
  let fetchCompletedAt = $state(0);
  let fetchedEvents = $state(0);
  let fetchedPages = $state(0);

  let _pauseHandle: PauseHandle | null = null;
  let _resumeRequested = false;
  let _lastPollToken = '';
  let _pollPaused = false;

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
    get fetchStartedAt() {
      return fetchStartedAt;
    },
    get fetchCompletedAt() {
      return fetchCompletedAt;
    },
    get fetchedEvents() {
      return fetchedEvents;
    },
    get fetchedPages() {
      return fetchedPages;
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
    startToken: string,
  ) => {
    livePollingController?.abort();
    livePollingController = new AbortController();
    runLivePoll({
      route: routeForApi('events.ascending', {
        namespace: ns,
        workflowId: wfId,
      }),
      runId: rId,
      startToken,
      signal: livePollingController.signal,
      onEvent: (ev) => {
        const isNew = appendLiveEvent(ev);
        if (isNew)
          latestEventId = Math.max(latestEventId, parseInt(ev.eventId));
        return isNew;
      },
      onNewEvents: () => bufferVersion.update((v) => v + 1),
    }).then((lastToken) => {
      _lastPollToken = lastToken;
    });
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
    fetchStartedAt = performance.now();
    fetchCompletedAt = 0;
    fetchedEvents = 0;
    fetchedPages = 0;
    _pauseHandle = null;

    // Start live poll immediately — concurrent with the bidirectional fetch.
    // Any events that arrive while the fetch is in progress are captured right
    // away rather than waiting for the full history to load first.
    // appendLiveEvent deduplicates events that the bidirectional fetch also
    // delivers; getEventArray() filters the live side at read time for safety.
    // Skip if the user has already paused auto-refresh — the pause $effect
    // will restart from _lastPollToken when they unpause.
    if (workflow.isRunning && !$pauseLiveUpdates) {
      startLivePoll(ns, wfId, rId, '');
    }

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
        fetchedEvents += events.length;
        fetchedPages++;
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
        fetchCompletedAt = performance.now();
        bufferVersion.update((v) => v + 1);
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
    });
  });

  const clearWorkflowData = () => {
    $timelineEvents = null;
    $workflowRun = initialWorkflowRun;
    $fullEventHistory = [];
    $bufferVersion = 0;
    workflowError = null;
    fetchComplete = false;
    latestEventId = 0;
    totalExpectedEvents = 0;
    descMinId = 0;
    fetchStartedAt = 0;
    fetchCompletedAt = 0;
    fetchedEvents = 0;
    fetchedPages = 0;
    _pauseHandle = null;
    _resumeRequested = false;
    _lastPollToken = '';
    _pollPaused = false;
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

  // Stop the live poll when the user pauses auto-refresh, and resume it from
  // the last cursor when they unpause. This avoids holding an open server
  // connection and accumulating events in liveGroups during a pause.
  $effect(() => {
    const paused = $pauseLiveUpdates;
    untrack(() => {
      if (paused && livePollingController) {
        _pollPaused = true;
        livePollingController.abort();
        livePollingController = null;
      } else if (!paused && _pollPaused && $workflowRun.workflow?.isRunning) {
        _pollPaused = false;
        startLivePoll(namespace, workflowId, runId, _lastPollToken);
      }
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
