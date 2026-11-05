<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, untrack } from 'svelte';

  import { page } from '$app/state';

  import WorkflowError from '$lib/components/workflow/workflow-error.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import Button from '$lib/io/button/button.svelte';
  import { IconRetry } from '$lib/io/icon';
  import WorkflowHeader from '$lib/layouts/workflow-header.svelte';
  import WorkflowHistoryProvider from '$lib/layouts/workflow-history-provider.svelte';
  import { throttleRefresh } from '$lib/services/events-service';
  import { getPollers } from '$lib/services/pollers-service';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { fetchWorkerCount } from '$lib/services/worker-service';
  import { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { resetLastDataEncoderSuccess } from '$lib/stores/data-encoder-config';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { pauseLiveUpdates } from '$lib/stores/events';
  import { workerCountEnabled } from '$lib/stores/workers';
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
  import { shouldRefetchWorkflowRun } from '$lib/utilities/should-refetch-workflow-run';

  interface Props {
    children: Snippet;
    headerSnippet?: Snippet;
  }

  let { children, headerSnippet = undefined }: Props = $props();

  let namespace = $derived(page.params.namespace);
  let workflowId = $derived(page.params.workflow);
  let runId = $derived(page.params.run);
  let showJson = $derived(page.url.searchParams.has('json'));
  let workerHeartbeatsEnabled = $derived(
    !!page.data?.namespace?.namespaceInfo?.capabilities?.workerHeartbeats,
  );
  let workerCountEnabledForNamespace = $derived(
    workerHeartbeatsEnabled && $workerCountEnabled,
  );

  let workflowError: NetworkError | null = $state(null);
  let workflowRunController: AbortController | null = null;
  let historyController = $state<WorkflowHistoryController | null>(null);

  let _refetchSeq = 0;

  const fullJson = $derived({
    ...$workflowRun,
    eventHistory: historyController?.history.events ?? [],
  });

  const { copy, copied } = copyToClipboard();

  const retryHistory = () => {
    const workflow = $workflowRun.workflow;
    if (workflow && historyController) {
      void historyController.retry(workflow);
    }
  };

  const handleCopy = (e: Event) => {
    copy(e, stringifyWithBigInt(fullJson));
  };

  const decodeWorkflowUserMetadata = async (
    workflow: WorkflowExecution,
    isCurrent: () => boolean,
  ) => {
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

      if (isCurrent()) $workflowRun = { ...$workflowRun, userMetadata };
    } catch (e) {
      if (isCurrent()) console.error('Error decoding user metadata', e);
    }
  };

  const isCurrentRoute = (
    controller: AbortController,
    ns: string,
    wfId: string,
    rId: string,
  ) =>
    !controller.signal.aborted &&
    workflowRunController === controller &&
    ns === namespace &&
    wfId === workflowId &&
    rId === runId;

  const getWorkflowAndEventHistory = async (
    ns: string,
    wfId: string,
    rId: string,
    controller: AbortController,
  ) => {
    const seq = ++_refetchSeq;
    const isCurrent = () =>
      isCurrentRoute(controller, ns, wfId, rId) && seq === _refetchSeq;
    const { workflow, error } = await fetchWorkflow(
      { namespace: ns, workflowId: wfId, runId: rId },
      (input, init) => fetch(input, { ...init, signal: controller.signal }),
    );

    if (!isCurrent()) return;
    if (error) {
      workflowError = error;
      return;
    }
    if (!workflow) return;

    await decodeWorkflowUserMetadata(workflow, isCurrent);
    if (!isCurrent()) return;

    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue!, namespace: ns });
    if (!isCurrent()) return;

    const history = new WorkflowHistoryController({
      workflowExecutionIdentity: {
        namespace: ns,
        workflowId: workflow.id,
        runId: workflow.runId,
      },
      pauseAfterPages: 2,
      liveUpdatesPaused: $pauseLiveUpdates,
    });

    historyController = history;
    void history.load(workflow);

    $workflowRun = { ...$workflowRun, workflow, workers, workersLoaded: true };

    const onWorkersRoute = page.url.pathname.endsWith('/workers');
    const isCurrentOwner = () =>
      isCurrentRoute(controller, ns, wfId, rId) &&
      historyController === history;

    if (workerCountEnabledForNamespace && taskQueue && !onWorkersRoute) {
      fetchWorkerCount(
        { namespace: ns, query: `TaskQueue="${taskQueue}"` },
        (input, init) => fetch(input, { ...init, signal: controller.signal }),
      ).then(({ count }) => {
        if (isCurrentOwner() && count !== undefined)
          $workflowRun.workerCount = count;
      });
    }

    if (workflow.isRunning && workers?.pollers?.length) {
      getWorkflowMetadata(
        { namespace: ns, workflow: { id: workflow.id, runId: workflow.runId } },
        controller.signal,
      ).then((metadata) => {
        if (isCurrentOwner()) $workflowRun.metadata = metadata;
      });
    }
  };

  const getOnlyWorkflowWithPendingActivities = async (
    refreshAction: RefreshAction,
    pause: boolean,
  ) => {
    const shouldFetch = shouldRefetchWorkflowRun({
      refresh: refreshAction,
      pauseLiveUpdates: pause,
      isRunning: $workflowRun?.workflow?.isRunning,
    });
    const controller = workflowRunController;
    const identity = historyController?.workflowExecutionIdentity;
    if (!shouldFetch || !controller || !identity || !historyController) return;

    // The 10s poll and an action's refetch overlap, so a poll that started
    // before a mutation can resolve after it and write back a pre-mutation
    // snapshot. Only the newest request for the current run may land.
    const seq = ++_refetchSeq;
    const ns = namespace;
    const wfId = workflowId;
    const rId = runId;

    const { workflow, error } = await fetchWorkflow(identity, (input, init) =>
      fetch(input, { ...init, signal: controller.signal }),
    );

    if (seq !== _refetchSeq) return;
    if (!isCurrentRoute(controller, ns, wfId, rId)) return;

    if (error) {
      workflowError = error;
      return;
    }
    $workflowRun.workflow = workflow ?? null;
  };

  const abortAll = () => {
    workflowRunController?.abort();
    workflowRunController = null;
    historyController?.dispose();
    historyController = null;
  };

  // Pending metadata comes from the workflow run, not the history. The buffer
  // holds it and applies it as heads arrive, so this only pushes on a refresh.
  $effect(() => {
    const workflow = $workflowRun.workflow;
    const controller = historyController;
    if (
      workflow &&
      controller &&
      workflow.id === controller.workflowExecutionIdentity.workflowId &&
      workflow.runId === controller.workflowExecutionIdentity.runId
    ) {
      untrack(() => controller.updateWorkflow(workflow));
    }
  });

  const clearWorkflowData = () => {
    $workflowRun = initialWorkflowRun;

    workflowError = null;
    _refetchSeq++;
    abortAll();
    resetLastDataEncoderSuccess();
  };

  // Clearing and refetching were separate effects on the same trigger, so
  // clear-before-fetch held only because Svelte runs effects in creation order
  // — reordering the declarations would have wiped each fetch.
  $effect(() => {
    const ns = namespace;
    const wfId = workflowId;
    const rId = runId;
    untrack(() => {
      clearWorkflowData();
      const controller = new AbortController();
      workflowRunController = controller;
      void getWorkflowAndEventHistory(ns, wfId, rId, controller);
    });
    return () => {
      untrack(clearWorkflowData);
    };
  });

  $effect(() => {
    const refreshValue = $refresh;
    const pause = $pauseLiveUpdates;
    untrack(() => {
      getOnlyWorkflowWithPendingActivities(refreshValue, pause);
    });
  });

  $effect(() => {
    const controller = historyController;
    const paused = $pauseLiveUpdates;
    untrack(() => controller?.setLiveUpdatesPaused(paused));
  });

  onMount(() => {
    const sort = page.url.searchParams.get('sort');
    if (sort === 'ascending' || sort === 'descending') $eventFilterSort = sort;
    const refreshInterval = setInterval(() => {
      throttleRefresh();
    }, 10000);

    return () => {
      clearInterval(refreshInterval);
    };
  });
</script>

{#if showJson}
  <div
    class="relative h-auto whitespace-break-spaces break-words bg-surface-primary p-4"
  >
    <CopyButton
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      class="absolute right-1 top-1"
      onclick={handleCopy}
      copied={$copied}
    />
    {stringifyWithBigInt(fullJson, undefined, 2)}
  </div>
{:else if workflowError}
  <WorkflowError error={workflowError} />
{:else if !$workflowRun.workflow || !historyController}
  <SkeletonWorkflow />
{:else}
  <WorkflowHistoryProvider controller={historyController}>
    <WorkflowHeader history={historyController.history} {headerSnippet} />
    {#if historyController.error}
      {@const error = historyController.error}
      {@const errorDetail =
        error.message?.trim() ||
        ('statusText' in error ? error.statusText?.trim() : '')}
      <Alert
        intent="error"
        title={translate('workflows.history-load-error')}
        data-testid="history-load-error"
        class="my-4"
      >
        <div class="space-y-3 pt-1">
          <div class="space-y-1">
            <p>{translate('workflows.history-load-error-description')}</p>
            {#if errorDetail}
              <p class="text-secondary">{errorDetail}</p>
            {/if}
          </div>
          <Button
            size="sm"
            colorScheme="tertiary"
            LeadingIcon={IconRetry}
            onclick={retryHistory}
          >
            {translate('workflows.history-load-retry')}
          </Button>
        </div>
      </Alert>
    {/if}
    {@render children()}
  </WorkflowHistoryProvider>
{/if}
