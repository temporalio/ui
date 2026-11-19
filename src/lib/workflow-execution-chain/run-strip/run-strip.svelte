<script lang="ts">
  import { tick } from 'svelte';

  import LiveRegion from '$lib/holocene/live-region.svelte';
  import type { I18nKey } from '$lib/i18n';
  import { translate } from '$lib/i18n/translate';
  import { isWorkflowOpen } from '$lib/models/workflow-status';
  import { createWallClock } from '$lib/runes/wall-clock.svelte';
  import { createAnnouncer } from '$lib/stores/announcer';
  import { getValidTimeMs } from '$lib/utilities/format-time';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  import type { ChainEvent, ChainRun, DiscoveryStep } from '../types';
  import type { WorkflowExecutionChain } from '../workflow-execution-chain.svelte';
  import {
    allocateCardWidths,
    applyFrozenWidths,
    CAP_WIDTH,
    CARD_GAP,
    freezeWidths,
    type FrozenWidths,
    layoutSegments,
    MIN_CARD_WIDTH,
    type RunSpan,
    steppedLiveDuration,
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
    preferredScrollBehavior,
    type ScrollMetrics,
  } from './run-strip-scroll.svelte';

  interface Props {
    chain: WorkflowExecutionChain;
    selectedRunId: string | null;
    live: boolean;
    onSelect: (runId: string) => void;
    onJumpToLive: () => void;
  }

  let { chain, selectedRunId, live, onSelect, onJumpToLive }: Props = $props();

  const DISCOVERY_ERROR_MESSAGES: Readonly<Record<DiscoveryStep, I18nKey>> = {
    walkBack: 'workflows.older-run-load-failed',
    handOff: 'workflows.next-run-load-failed',
    refresh: 'workflows.run-status-stale',
    finalDescribe: 'workflows.run-status-stale',
    closeEvent: 'workflows.next-run-check-failed',
  };

  const announcer = createAnnouncer();
  const messages = announcer.messages;
  const readWallClock = createWallClock();

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
  const allocatedWidths = $derived(
    allocateCardWidths(
      runSpans.map(({ startMs, endMs, live }) =>
        live ? steppedLiveDuration(endMs - startMs) : endMs - startMs,
      ),
      cardsViewportWidth,
    ),
  );
  let frozenWidths = $state.raw<FrozenWidths | null>(null);
  const cardWidths = $derived(
    applyFrozenWidths(
      runs.map((run) => run.runId),
      allocatedWidths,
      frozenWidths,
      { viewportWidth: cardsViewportWidth, latestRunId: chain.latestRunId },
    ),
  );
  const olderPlaceholderWidth = $derived(
    chain.failedOlderRunId || chain.walking ? MIN_CARD_WIDTH + CARD_GAP : 0,
  );
  const segments = $derived(
    layoutSegments(
      cardWidths,
      runSpans,
      CAP_WIDTH + CARD_GAP + olderPlaceholderWidth,
    ),
  );
  const scrollIndicators = $derived(getScrollIndicators(scrollMetrics));
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
      chain.failedSuccessorRunId ?? '',
    ].join('|'),
  );

  const newerRunArrived = $derived(
    !live &&
      newerArrivedForRunId !== null &&
      newerArrivedForRunId === selectedRunId,
  );

  const scrollToOldestEnd = () => {
    scroller?.scrollTo({ left: 0, behavior: preferredScrollBehavior() });
  };

  const freezeCurrentWidths = () => {
    frozenWidths = freezeWidths(
      runs.map((run) => run.runId),
      cardWidths,
      cardsViewportWidth,
    );
  };

  const freezeWidthsUnlessFollowingEnd = (followingEnd: boolean) => {
    if (followingEnd) {
      frozenWidths = null;
      return;
    }
    freezeCurrentWidths();
  };

  const updateScrollMetrics = (metrics: ScrollMetrics) => {
    scrollMetrics = metrics;
    if (frozenWidths && frozenWidths.viewportWidth !== cardsViewportWidth) {
      freezeCurrentWidths();
    }
  };

  const loadOlderRuns = async (onRunAdded: (runId: string) => void) => {
    const runCountBeforeLoad = chain.runs.length;
    const loading = chain.loadOlder(onRunAdded);
    await tick();
    scrollToOldestEnd();
    await loading;
    const loadedRunCount = chain.runs.length - runCountBeforeLoad;
    if (loadedRunCount > 0) {
      announcer.announce(
        translate('workflows.announce-older-runs', { count: loadedRunCount }),
      );
    }
  };

  const announceChainEvent = (event: ChainEvent) => {
    if (event.type === 'closed') {
      announcer.announce(translate('workflows.chain-closed'));
      return;
    }
    if (event.type === 'discoveryError') {
      announcer.announce(translate(DISCOVERY_ERROR_MESSAGES[event.step]));
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
    nextRunCheckFailed={chain.nextRunCheckFailed}
    onRetryNextRunCheck={() => chain.retryNextRunCheck()}
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
        onMetricsChange: updateScrollMetrics,
        onFollowingEndChange: freezeWidthsUnlessFollowingEnd,
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
            {chain}
            {cardWidths}
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
