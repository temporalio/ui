<script lang="ts">
  import LiveRegion from '$lib/holocene/live-region.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isWorkflowOpen } from '$lib/models/workflow-status';
  import { createWallClock } from '$lib/runes/wall-clock.svelte';
  import { createAnnouncer } from '$lib/stores/announcer';
  import { getValidTimeMs } from '$lib/utilities/format-time';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  import type { ChainEvent, ChainRun } from '../types';
  import type { WorkflowExecutionChain } from '../workflow-execution-chain.svelte';
  import {
    allocateCardWidths,
    CAP_WIDTH,
    CARD_GAP,
    layoutSegments,
    liveCardWidth,
    MIN_CARD_WIDTH,
    type RunSpan,
    TRAILING_PADDING,
  } from './card-layout';

  import JumpToLiveButton from './jump-to-live-button.svelte';
  import PreviousRunButton from './previous-run-button.svelte';
  import RunCards from './run-cards.svelte';
  import RunRuler from './run-ruler.svelte';
  import RunStripHeader from './run-strip-header.svelte';
  import {
    createRunStripFollowAttachment,
    getScrollIndicators,
    type ScrollMetrics,
    scrollSegmentIntoView,
  } from './run-strip-scroll.svelte';

  interface Props {
    chain: WorkflowExecutionChain;
    selectedRunId: string | null;
    live: boolean;
    onSelect: (runId: string) => void;
    onJumpToLive: () => void;
  }

  let { chain, selectedRunId, live, onSelect, onJumpToLive }: Props = $props();

  const announcer = createAnnouncer();
  const messages = announcer.messages;
  const readWallClock = createWallClock();

  let runCards = $state<ReturnType<typeof RunCards>>();
  let scroller = $state<HTMLDivElement>();
  let scrollMetrics = $state<ScrollMetrics>();
  let newerArrivedForRunId = $state<string | null>(null);

  const runs = $derived(chain.runs);
  const latestRun = $derived(
    runs.find((run) => run.runId === chain.latestRunId),
  );
  const latestRunOpen = $derived(
    Boolean(latestRun && isWorkflowOpen(latestRun.workflow)),
  );
  const followingChain = $derived(chain.status === 'ready');
  const now = $derived(followingChain ? readWallClock() : Date.now());
  const latestIsLive = $derived(
    followingChain && runs.at(-1)?.runId === chain.latestRunId,
  );

  const runEndMs = ({ runId, workflow }: ChainRun): number =>
    getValidTimeMs(chain.controllers.get(runId)?.closeEvent?.eventTime) ??
    getWorkflowLatestTime(workflow, now);

  const runSpans = $derived(
    runs.map((run, index): RunSpan => {
      const endMs = runEndMs(run);
      const startMs = getValidTimeMs(run.workflow.startTime) ?? endMs;
      return {
        id: run.runId,
        startMs,
        endMs: Math.max(startMs, endMs),
        live: latestIsLive && index === runs.length - 1,
      };
    }),
  );
  const cardsViewportWidth = $derived(
    Math.max(
      MIN_CARD_WIDTH,
      (scrollMetrics?.clientWidth ?? 0) -
        2 * (CAP_WIDTH + CARD_GAP) -
        TRAILING_PADDING,
    ),
  );
  const cardWidths = $derived(
    allocateCardWidths(
      runSpans.map(({ startMs, endMs }) => endMs - startMs),
      cardsViewportWidth,
      { latestIsLive },
    ),
  );
  const pendingCardWidth = $derived(
    liveCardWidth(runs.length + 1, cardsViewportWidth),
  );
  const segments = $derived(
    layoutSegments(cardWidths, runSpans, CAP_WIDTH + CARD_GAP),
  );
  const selectedSegment = $derived(
    segments.find((segment) => segment.id === selectedRunId),
  );
  const scrollIndicators = $derived(
    getScrollIndicators(scrollMetrics, selectedSegment),
  );
  const nowX = $derived.by(() => {
    const lastSegment = segments[segments.length - 1];
    return followingChain && lastSegment
      ? lastSegment.x + lastSegment.width
      : undefined;
  });
  const layoutKey = $derived(
    [
      ...segments.map(
        ({ id, x, width }) => `${id}:${Math.round(x)}:${Math.round(width)}`,
      ),
      chain.pendingSuccessorRunId ?? '',
    ].join('|'),
  );

  const newerRunArrived = $derived(
    !live &&
      newerArrivedForRunId !== null &&
      newerArrivedForRunId === selectedRunId,
  );

  const loadOlderRuns = async () => {
    const runCountBeforeLoad = chain.runs.length;
    await chain.loadOlder();
    const loadedRunCount = chain.runs.length - runCountBeforeLoad;
    if (loadedRunCount > 0) {
      announcer.announce(
        translate('workflows.announce-older-runs', { count: loadedRunCount }),
      );
    }
  };

  const scrollToSelected = () => {
    if (!selectedRunId) {
      return;
    }
    runCards?.focusRun(selectedRunId);
    if (scroller && selectedSegment) {
      scrollSegmentIntoView(scroller, selectedSegment);
    }
  };

  const announceChainEvent = (event: ChainEvent) => {
    if (event.type === 'closed') {
      announcer.announce(translate('workflows.chain-closed'));
      return;
    }
    if (event.type === 'discoveryError') {
      announcer.announce(translate('workflows.discovery-error'));
      return;
    }
    if (live) {
      announcer.announce(
        translate('workflows.announce-latest-run', {
          shortId: event.runId.slice(0, 8),
        }),
      );
      return;
    }
    newerArrivedForRunId = selectedRunId;
    announcer.announce(translate('workflows.newer-run-available'));
  };

  $effect(function subscribeToChainEvents() {
    return chain.subscribe(announceChainEvent);
  });

  $effect(() => () => announcer.clear());
</script>

<section class="flex flex-col gap-3" data-testid="run-strip">
  <RunStripHeader
    runCount={runs.length}
    hasDiscoveryError={chain.hasDiscoveryError}
    selectedOutOfView={scrollIndicators.selectedOutOfView}
    onRetryDiscovery={() => chain.retryDiscovery()}
    onScrollToSelected={scrollToSelected}
  />

  <div
    class="relative rounded-lg border border-primary bg-surface-primary px-3 pb-1.5"
  >
    <div
      bind:this={scroller}
      {@attach createRunStripFollowAttachment({
        getSegments: () => segments,
        getLayoutKey: () => layoutKey,
        getSelectedRunId: () => selectedRunId,
        isLive: () => live,
        onMetricsChange: (metrics) => (scrollMetrics = metrics),
      })}
      data-testid="run-strip-scroller"
      class="relative overflow-x-auto pb-2.5 [scrollbar-width:thin]"
    >
      <div
        class="group/strip relative w-max min-w-full"
        style:padding-right="{TRAILING_PADDING}px"
      >
        <RunRuler {segments} {selectedRunId} {live} {nowX} />

        <div class="flex items-stretch gap-1.5">
          <PreviousRunButton
            {chain}
            {selectedRunId}
            contentScrolledUnder={scrollIndicators.scrolledFromStart}
            {loadOlderRuns}
            {onSelect}
          />
          <RunCards
            bind:this={runCards}
            {chain}
            {cardWidths}
            {pendingCardWidth}
            {now}
            {selectedRunId}
            {live}
            {onSelect}
          />
          <JumpToLiveButton
            {live}
            {latestRunOpen}
            chainClosed={chain.status === 'closed'}
            {newerRunArrived}
            contentScrolledUnder={scrollIndicators.scrolledFromEnd}
            {onJumpToLive}
          />
        </div>
      </div>
    </div>
  </div>
  <LiveRegion messages={$messages} data-testid="run-strip-announcer" />
</section>
