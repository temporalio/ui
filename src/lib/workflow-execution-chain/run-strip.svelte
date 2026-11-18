<script lang="ts">
  import { prefersReducedMotion } from 'svelte/motion';

  import { tick, untrack } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import LiveRegion from '$lib/holocene/live-region.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Button } from '$lib/io/button';
  import {
    IconArrowLeft,
    IconArrowRightToLine,
    IconChevronLeft,
    IconFlag,
    IconInfo,
    IconTarget,
    IconWarning,
  } from '$lib/io/icon';
  import { isWorkflowOpen } from '$lib/models/workflow-status';
  import { createWallClock } from '$lib/runes/wall-clock.svelte';
  import { createAnnouncer } from '$lib/stores/announcer';
  import { getValidTimeMs } from '$lib/utilities/format-time';
  import { createRovingFocusState } from '$lib/utilities/roving-focus';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  import {
    allocateCardWidths,
    CAP_WIDTH,
    CARD_GAP,
    GAP_WIDTH,
    layoutSegments,
    MIN_CARD_WIDTH,
  } from './run-strip-layout';
  import { transitionOf } from './transitions';
  import type { ChainEvent, ChainRun } from './types';

  import RunCard from './run-card.svelte';
  import RunRuler from './run-ruler.svelte';
  import RunTransition from './run-transition.svelte';
  import type { WorkflowExecutionChain } from './workflow-execution-chain.svelte';

  interface Props {
    chain: WorkflowExecutionChain;
    selectedRunId: string | null;
    live: boolean;
    onSelect: (runId: string) => void;
    onJumpToLive: () => void;
  }

  let { chain, selectedRunId, live, onSelect, onJumpToLive }: Props = $props();

  const TRAILING_PADDING = 4;
  const SKELETON_CARDS = [0, 1, 2, 3];
  const GAP_ITEM = Symbol('gap');

  type RunIdOrGap = string | typeof GAP_ITEM;
  type StripItem =
    | { kind: 'run'; id: string; run: ChainRun; index: number; first: boolean }
    | { kind: 'gap'; id: typeof GAP_ITEM };

  const id = $props.id();
  const descriptionId = `${id}-description`;
  const announcer = createAnnouncer();
  const messages = announcer.messages;
  const cardElements: Record<string, HTMLButtonElement | null> = {};
  let gapElement = $state<HTMLButtonElement | null>(null);

  let scroller = $state<HTMLDivElement>();
  let viewportWidth = $state(0);
  let scrolledFromStart = $state(false);
  let scrolledFromEnd = $state(false);
  let selectedOutOfView = $state(false);
  let newerArrivedForRunId = $state<string | null>(null);
  const readWallClock = createWallClock();

  const runs = $derived(chain.runs);
  const detachedRuns = $derived(chain.detachedRuns);
  const stripRuns = $derived([...detachedRuns, ...runs]);
  const stripRunIds = $derived(stripRuns.map((run) => run.runId));
  const hasGap = $derived(detachedRuns.length > 0);
  const gapLoadsOlder = $derived(hasGap && !chain.detachedOffPath);
  const gapDisabled = $derived(chain.walking || chain.boundary !== null);
  const stripItems = $derived.by((): StripItem[] => {
    const runItem = (
      run: ChainRun,
      index: number,
      first: boolean,
    ): StripItem => ({
      kind: 'run',
      id: run.runId,
      run,
      index,
      first,
    });
    return [
      ...detachedRuns.map((run, index) => runItem(run, index, index === 0)),
      ...(hasGap ? [{ kind: 'gap', id: GAP_ITEM } as const] : []),
      ...runs.map((run, index) =>
        runItem(run, detachedRuns.length + index, index === 0),
      ),
    ];
  });
  const rovingItems = $derived<RunIdOrGap[]>(
    stripItems
      .filter((item) => item.kind === 'run' || gapLoadsOlder)
      .map((item) => item.id),
  );
  const latestRun = $derived(
    runs.find((run) => run.runId === chain.latestRunId),
  );
  const latestRunOpen = $derived(
    Boolean(latestRun && isWorkflowOpen(latestRun.workflow)),
  );
  const now = $derived(latestRunOpen ? readWallClock() : Date.now());
  const selectedIndex = $derived(
    selectedRunId ? stripRunIds.indexOf(selectedRunId) : -1,
  );
  const selectedInDetached = $derived(
    selectedIndex >= 0 && selectedIndex < detachedRuns.length,
  );
  const selectedGroupStartIndex = $derived(
    selectedInDetached ? 0 : detachedRuns.length,
  );

  const preferredScrollBehavior = (): ScrollBehavior =>
    prefersReducedMotion.current ? 'auto' : 'smooth';

  const rovingFocus = createRovingFocusState<RunIdOrGap>({
    getItems: () => rovingItems,
    getElement: (runIdOrGap) =>
      runIdOrGap === GAP_ITEM ? gapElement : cardElements[runIdOrGap],
    getResetItem: () => selectedRunId ?? undefined,
    loop: false,
    onNavigate: (_, element) => {
      element.scrollIntoView({
        inline: 'nearest',
        block: 'nearest',
        behavior: preferredScrollBehavior(),
      });
    },
  });

  const runSpans = $derived(
    stripRuns.map(({ runId, workflow }) => {
      const endMs = getWorkflowLatestTime(workflow, now);
      const startMs = getValidTimeMs(workflow.startTime) ?? endMs;
      return { id: runId, startMs, endMs: Math.max(startMs, endMs) };
    }),
  );
  const cardsViewportWidth = $derived(
    Math.max(
      MIN_CARD_WIDTH,
      viewportWidth - 2 * (CAP_WIDTH + CARD_GAP) - TRAILING_PADDING,
    ),
  );
  const cardWidths = $derived(
    allocateCardWidths(
      runSpans.map(({ startMs, endMs }) => endMs - startMs),
      cardsViewportWidth,
    ),
  );
  const segments = $derived(
    layoutSegments(
      cardWidths,
      runSpans,
      CAP_WIDTH + CARD_GAP,
      hasGap
        ? { beforeIndex: detachedRuns.length, width: GAP_WIDTH }
        : undefined,
    ),
  );
  const gapX = $derived.by(() => {
    const firstWindowSegment = segments[detachedRuns.length];
    return hasGap && firstWindowSegment
      ? firstWindowSegment.x - CARD_GAP - GAP_WIDTH
      : undefined;
  });
  const nowX = $derived.by(() => {
    const lastSegment = segments[segments.length - 1];
    return latestRunOpen && lastSegment
      ? lastSegment.x + lastSegment.width
      : undefined;
  });

  const previousRunLoading = $derived(
    selectedInDetached ? chain.detachedWalking : chain.walking,
  );

  const previousRunButton = $derived.by(() => {
    if (selectedIndex < 0) {
      return {
        disabled: true,
        tooltip: translate('workflows.view-previous-run'),
      };
    }
    if (selectedIndex > selectedGroupStartIndex) {
      return {
        disabled: false,
        tooltip: translate('workflows.view-previous-run'),
      };
    }
    const boundary = selectedInDetached
      ? chain.detachedBoundary
      : chain.boundary;
    if (boundary === 'chainStart') {
      return { disabled: true, tooltip: translate('workflows.start-of-chain') };
    }
    if (boundary === 'retention') {
      return { disabled: true, tooltip: translate('workflows.past-retention') };
    }
    return {
      disabled: previousRunLoading,
      tooltip: translate('workflows.view-previous-run'),
    };
  });

  const jumpToLiveLabel = $derived(
    latestRunOpen || chain.status !== 'closed'
      ? translate('workflows.jump-to-live')
      : translate('workflows.view-latest-run'),
  );
  const jumpToLiveTooltip = $derived.by(() => {
    if (!live) {
      return jumpToLiveLabel;
    }
    return latestRunOpen
      ? translate('workflows.viewing-live')
      : translate('workflows.viewing-latest-run');
  });

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

  const selectPreviousRun = async () => {
    if (previousRunButton.disabled) {
      return;
    }
    if (selectedIndex > selectedGroupStartIndex) {
      onSelect(stripRunIds[selectedIndex - 1]);
      return;
    }
    const runIdWhenClicked = selectedRunId;
    if (selectedInDetached) {
      const predecessorRunId = await chain.loadDetachedPredecessor();
      if (predecessorRunId && runIdWhenClicked === selectedRunId) {
        onSelect(predecessorRunId);
      }
      return;
    }
    await loadOlderRuns();
    if (runIdWhenClicked !== selectedRunId) {
      return;
    }
    const windowIndex = chain.runs.findIndex(
      (run) => run.runId === runIdWhenClicked,
    );
    if (windowIndex > 0) {
      onSelect(chain.runs[windowIndex - 1].runId);
    }
  };

  const loadOlderFromGap = async () => {
    if (gapDisabled) {
      return;
    }
    const gapFocused = document.activeElement === gapElement;
    const detachedNewestRunId = detachedRuns[detachedRuns.length - 1]?.runId;
    await loadOlderRuns();
    await tick();
    if (gapFocused && !gapElement && detachedNewestRunId) {
      cardElements[detachedNewestRunId]?.focus();
    }
  };

  const jumpToLive = () => {
    if (live) {
      return;
    }
    onJumpToLive();
  };

  const updateScrollIndicators = () => {
    if (!scroller) {
      return;
    }
    const { scrollLeft, clientWidth, scrollWidth } = scroller;
    scrolledFromStart = scrollLeft > 1;
    scrolledFromEnd = scrollLeft + clientWidth < scrollWidth - 1;
    const selectedSegment = segments[selectedIndex];
    selectedOutOfView = Boolean(
      selectedSegment &&
      (selectedSegment.x + selectedSegment.width <
        scrollLeft + CAP_WIDTH + CARD_GAP ||
        selectedSegment.x > scrollLeft + clientWidth - CAP_WIDTH - CARD_GAP),
    );
  };

  const scrollSelectedIntoView = () => {
    const selectedSegment = segments[selectedIndex];
    if (!scroller || !selectedSegment) {
      return;
    }
    const inset = CAP_WIDTH + CARD_GAP;
    const left = selectedSegment.x - inset;
    const right =
      selectedSegment.x + selectedSegment.width + inset + TRAILING_PADDING;
    if (left < scroller.scrollLeft) {
      scroller.scrollTo({ left, behavior: preferredScrollBehavior() });
      return;
    }
    if (right > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollTo({
        left: right - scroller.clientWidth,
        behavior: preferredScrollBehavior(),
      });
    }
  };

  const focusSelectedCard = () => {
    if (!selectedRunId) {
      return;
    }
    cardElements[selectedRunId]?.focus({ preventScroll: true });
    scrollSelectedIntoView();
  };

  $effect(function autoScroll() {
    void selectedRunId;
    void stripRuns.length;
    untrack(() => {
      void tick().then(() => {
        if (!scroller) {
          return;
        }
        if (live) {
          scroller.scrollTo({
            left: scroller.scrollWidth,
            behavior: preferredScrollBehavior(),
          });
        } else {
          scrollSelectedIntoView();
        }
        updateScrollIndicators();
      });
    });
  });

  $effect(function updateScrollIndicatorsOnLayout() {
    void segments;
    void viewportWidth;
    untrack(() => void tick().then(updateScrollIndicators));
  });

  const showNewerRunIndicator = $derived(
    !live &&
      newerArrivedForRunId !== null &&
      newerArrivedForRunId === selectedRunId,
  );

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
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <h2 class="flex items-center gap-2">
      <span class="text-xl font-medium"
        >{translate('workflows.run-details')}</span
      >
      {#if runs.length}
        <span class="text-base text-secondary"
          >{translate('workflows.runs-loaded', { count: runs.length })}</span
        >
      {/if}
      <Tooltip text={translate('workflows.run-details-info')} width={280} top>
        <span
          class="flex text-sm text-secondary"
          role="img"
          aria-label={translate('workflows.run-details-info')}
        >
          <IconInfo />
        </span>
      </Tooltip>
    </h2>
    <div
      class="flex items-center gap-2 text-xs text-secondary"
      data-testid="run-strip-status"
    >
      {#if chain.hasDiscoveryError}
        <span class="flex items-center gap-1 text-danger"
          ><IconWarning />{translate('workflows.discovery-error')}</span
        >
        <Button
          size="xs"
          colorScheme="secondary"
          onclick={() => chain.retryDiscovery()}
          >{translate('common.retry')}</Button
        >
      {:else if chain.status === 'closed'}
        <span class="flex items-center gap-1"
          ><IconFlag />{translate('workflows.chain-closed')}</span
        >
      {/if}
      {#if selectedOutOfView}
        <Button
          size="xs"
          colorScheme="ghost"
          LeadingIcon={IconTarget}
          onclick={focusSelectedCard}
          >{translate('workflows.scroll-to-selected')}</Button
        >
      {/if}
    </div>
  </div>

  <div
    class="relative rounded-lg border border-primary bg-surface-primary px-3 pb-1.5"
  >
    <div
      bind:this={scroller}
      bind:clientWidth={viewportWidth}
      onscroll={updateScrollIndicators}
      class="relative overflow-x-auto pb-2.5 [scrollbar-width:thin]"
    >
      <div
        class="group/strip relative w-max min-w-full"
        style:padding-right="{TRAILING_PADDING}px"
      >
        <RunRuler {segments} {selectedIndex} {live} {nowX} {gapX} />

        <div class="flex items-stretch gap-1.5">
          <div class="sticky left-0 z-30 flex w-9 shrink-0 bg-surface-primary">
            <Tooltip
              text={previousRunButton.tooltip}
              top
              usePortal
              class="flex w-full"
            >
              <button
                type="button"
                aria-label={translate('workflows.view-previous-run')}
                aria-disabled={previousRunButton.disabled ? 'true' : undefined}
                aria-busy={previousRunLoading &&
                selectedIndex === selectedGroupStartIndex
                  ? 'true'
                  : undefined}
                onclick={selectPreviousRun}
                class="flex w-full items-center justify-center rounded border border-brand bg-surface-primary text-brand shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press aria-disabled:cursor-not-allowed aria-disabled:opacity-disabled aria-disabled:shadow-sm"
              >
                <IconChevronLeft />
              </button>
            </Tooltip>
            <span
              class={twMerge(
                'pointer-events-none absolute -bottom-1 -top-1 left-full w-7 bg-gradient-to-r from-[var(--color-surface-primary)] to-transparent opacity-0 transition-opacity',
                scrolledFromStart && 'opacity-100',
              )}
            ></span>
          </div>

          {#snippet runCard(run: ChainRun, index: number, first: boolean)}
            {@const transition = transitionOf(run.startedEvent)}
            {#if !first && transition}
              <RunTransition {transition} />
            {/if}
            <RunCard
              {run}
              namespace={chain.identity.namespace}
              controller={chain.controllers.get(run.runId)}
              cardLoad={chain.cardLoadOf(run.runId)}
              {transition}
              width={cardWidths[index] ?? MIN_CARD_WIDTH}
              {now}
              selected={run.runId === selectedRunId}
              isLatest={run.runId === chain.latestRunId}
              {live}
              tabIndex={rovingFocus.tabIndex(run.runId)}
              bind:buttonElement={cardElements[run.runId]}
              onSelect={() => onSelect(run.runId)}
              onRetry={() => chain.retryCard(run.runId)}
            />
          {/snippet}

          {#if runs.length === 0}
            {#each SKELETON_CARDS as card (card)}
              <div
                class="flex shrink-0 flex-col gap-2 rounded-md border border-secondary bg-surface-secondary p-2"
                style:width="{MIN_CARD_WIDTH}px"
              >
                <Skeleton class="h-3.5 w-3/4" />
                <Skeleton class="h-1.5 w-full rounded-full" />
                <Skeleton class="h-3.5 w-1/2" />
              </div>
            {/each}
          {:else}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div
              role="group"
              aria-label={translate('workflows.runs-group-label', {
                count: stripRuns.length,
              })}
              aria-describedby={descriptionId}
              class="flex items-stretch gap-1.5"
              onkeydown={rovingFocus.onkeydown}
              onfocusin={rovingFocus.onfocusin}
              onfocusout={rovingFocus.onfocusout}
            >
              {#each stripItems as item (item.id)}
                {#if item.kind === 'run'}
                  {@render runCard(item.run, item.index, item.first)}
                {:else if gapLoadsOlder}
                  <button
                    bind:this={gapElement}
                    type="button"
                    tabindex={rovingFocus.tabIndex(GAP_ITEM)}
                    aria-disabled={gapDisabled ? 'true' : undefined}
                    aria-busy={chain.walking ? 'true' : undefined}
                    onclick={loadOlderFromGap}
                    class="flex shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-secondary px-2 text-center text-xs text-secondary transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press aria-disabled:cursor-not-allowed aria-disabled:opacity-disabled aria-disabled:hover:border-secondary aria-disabled:hover:text-secondary"
                    style:width="{GAP_WIDTH}px"
                    data-testid="run-strip-gap"
                  >
                    <IconArrowLeft />
                    {translate('workflows.load-older-runs')}
                  </button>
                {:else}
                  <Tooltip
                    text={translate('workflows.replaced-by-reset-description')}
                    top
                    usePortal
                    class="flex shrink-0"
                  >
                    <div
                      class="flex h-full flex-col items-center justify-center gap-1 border-x border-dashed border-secondary px-2 text-center text-xs text-secondary"
                      style:width="{GAP_WIDTH}px"
                      data-testid="run-strip-off-path"
                    >
                      <IconWarning />
                      {translate('workflows.replaced-by-reset')}
                    </div>
                  </Tooltip>
                {/if}
              {/each}
            </div>
            {#if chain.pendingSuccessorRunId}
              <div
                class="flex shrink-0 flex-col gap-2 rounded-md border border-secondary bg-surface-secondary p-2"
                style:width="{MIN_CARD_WIDTH}px"
                data-testid="run-card-pending"
                aria-hidden="true"
              >
                <Skeleton class="h-3.5 w-3/4" />
                <Skeleton class="h-1.5 w-full rounded-full" />
                <Skeleton class="h-3.5 w-1/2" />
              </div>
            {/if}
          {/if}

          <div class="sticky right-0 z-30 flex w-9 shrink-0 bg-surface-primary">
            <span
              class={twMerge(
                'pointer-events-none absolute -bottom-1 -top-1 right-full w-7 bg-gradient-to-l from-[var(--color-surface-primary)] to-transparent opacity-0 transition-opacity',
                scrolledFromEnd && 'opacity-100',
              )}
            ></span>
            <Tooltip
              text={jumpToLiveTooltip}
              topLeft
              usePortal
              class="flex w-full"
            >
              <button
                type="button"
                aria-label={jumpToLiveLabel}
                aria-disabled={live ? 'true' : undefined}
                onclick={jumpToLive}
                class="relative flex w-full items-center justify-center rounded border border-brand bg-surface-primary text-brand shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press aria-disabled:cursor-not-allowed aria-disabled:opacity-disabled aria-disabled:shadow-sm"
              >
                <IconArrowRightToLine />
                {#if showNewerRunIndicator && !live}
                  <span
                    class="absolute right-1 top-1 size-2 rounded-full bg-interactive-primary motion-safe:animate-pulse"
                    data-testid="newer-run-indicator"
                  ></span>
                {/if}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
  <span id={descriptionId} class="sr-only"
    >{translate('workflows.runs-group-description')}</span
  >
  <LiveRegion messages={$messages} data-testid="run-strip-announcer" />
</section>
