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
    IconArrowRightToLine,
    IconChevronLeft,
    IconFlag,
    IconInfo,
    IconTarget,
    IconWarning,
  } from '$lib/io/icon';
  import { createAnnouncer } from '$lib/stores/announcer';
  import { createRovingFocusState } from '$lib/utilities/roving-focus';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  import {
    allocateCardWidths,
    CAP_WIDTH,
    CARD_GAP,
    layoutSegments,
    MIN_CARD_WIDTH,
  } from './run-strip-layout';
  import { transitionOf } from './transitions';
  import type { ChainEvent } from './types';

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

  const PADDING = 4;
  const SKELETON_CARDS = [0, 1, 2, 3];

  const id = $props.id();
  const descriptionId = `${id}-description`;
  const announcer = createAnnouncer();
  const messages = announcer.messages;
  const cardElements: Record<string, HTMLButtonElement | null> = {};

  let scroller = $state<HTMLDivElement>();
  let viewportWidth = $state(0);
  let scrolledFromStart = $state(false);
  let scrolledFromEnd = $state(false);
  let selectedOutOfView = $state(false);
  let newerArrivedForRunId = $state<string | null>(null);
  let now = $state(Date.now());

  const runs = $derived(chain.runs);
  const runIds = $derived(runs.map((run) => run.runId));
  const latestRun = $derived(
    runs.find((run) => run.runId === chain.latestRunId),
  );
  const latestOpen = $derived(Boolean(latestRun?.workflow.isRunning));
  const selectedIndex = $derived(
    selectedRunId ? runIds.indexOf(selectedRunId) : -1,
  );

  const preferredScrollBehavior = (): ScrollBehavior =>
    prefersReducedMotion.current ? 'auto' : 'smooth';

  const roving = createRovingFocusState<string>({
    getItems: () => runIds,
    getElement: (runId) => cardElements[runId],
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

  $effect(() => {
    if (!latestOpen) {
      return;
    }
    now = Date.now();
    const interval = setInterval(() => {
      now = Date.now();
    }, 1000);
    return () => clearInterval(interval);
  });

  const spans = $derived(
    runs.map(({ runId, workflow }) => {
      const startMs = Date.parse(workflow.startTime);
      const endMs = getWorkflowLatestTime(workflow, now);
      return { id: runId, startMs, endMs: Math.max(startMs, endMs) };
    }),
  );
  const cardsViewport = $derived(
    Math.max(
      MIN_CARD_WIDTH,
      viewportWidth - 2 * (CAP_WIDTH + CARD_GAP) - 2 * PADDING,
    ),
  );
  const widths = $derived(
    allocateCardWidths(
      spans.map(({ startMs, endMs }) => endMs - startMs),
      cardsViewport,
    ),
  );
  const segments = $derived(
    layoutSegments(widths, spans, CAP_WIDTH + CARD_GAP),
  );
  const nowX = $derived.by(() => {
    const last = segments[segments.length - 1];
    return latestOpen && last ? last.x + last.width : undefined;
  });

  const previous = $derived.by(() => {
    if (selectedIndex < 0) {
      return {
        disabled: true,
        tooltip: translate('workflows.view-previous-run'),
      };
    }
    if (selectedIndex > 0) {
      return {
        disabled: false,
        tooltip: translate('workflows.view-previous-run'),
      };
    }
    if (chain.boundary === 'chainStart') {
      return { disabled: true, tooltip: translate('workflows.start-of-chain') };
    }
    if (chain.boundary === 'retention') {
      return { disabled: true, tooltip: translate('workflows.past-retention') };
    }
    return {
      disabled: chain.walking,
      tooltip: translate('workflows.view-previous-run'),
    };
  });

  const jumpLabel = $derived(
    latestOpen || chain.status !== 'closed'
      ? translate('workflows.jump-to-live')
      : translate('workflows.view-latest-run'),
  );
  const jumpTooltip = $derived.by(() => {
    if (!live) {
      return jumpLabel;
    }
    return latestOpen
      ? translate('workflows.viewing-live')
      : translate('workflows.viewing-latest-run');
  });

  const selectPrevious = async () => {
    if (previous.disabled) {
      return;
    }
    if (selectedIndex > 0) {
      onSelect(runIds[selectedIndex - 1]);
      return;
    }
    const from = selectedRunId;
    const before = runs.length;
    await chain.loadOlder();
    const added = chain.runs.length - before;
    if (added > 0) {
      announcer.announce(
        translate('workflows.announce-older-runs', { count: added }),
      );
    }
    if (from !== selectedRunId) {
      return;
    }
    const index = chain.runs.findIndex((run) => run.runId === from);
    if (index > 0) {
      onSelect(chain.runs[index - 1].runId);
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
    const segment = segments[selectedIndex];
    selectedOutOfView = Boolean(
      segment &&
      (segment.x + segment.width < scrollLeft + CAP_WIDTH + CARD_GAP ||
        segment.x > scrollLeft + clientWidth - CAP_WIDTH - CARD_GAP),
    );
  };

  const scrollSelectedIntoView = () => {
    const segment = segments[selectedIndex];
    if (!scroller || !segment) {
      return;
    }
    const inset = CAP_WIDTH + CARD_GAP;
    const left = segment.x - inset;
    const right = segment.x + segment.width + inset + PADDING;
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
    void runs.length;
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

  const newerArrived = $derived(
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
      {#if chain.status === 'discoveryError'}
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
        style:padding-right="{PADDING}px"
      >
        <RunRuler {segments} {selectedIndex} {live} {nowX} />

        <div class="flex items-stretch gap-1.5">
          <div class="sticky left-0 z-30 flex w-9 shrink-0 bg-surface-primary">
            <Tooltip text={previous.tooltip} top usePortal class="flex w-full">
              <button
                type="button"
                aria-label={translate('workflows.view-previous-run')}
                aria-disabled={previous.disabled ? 'true' : undefined}
                aria-busy={chain.walking && selectedIndex === 0
                  ? 'true'
                  : undefined}
                onclick={selectPrevious}
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
                count: runs.length,
              })}
              aria-describedby={descriptionId}
              class="flex items-stretch gap-1.5"
              onkeydown={roving.onkeydown}
              onfocusin={roving.onfocusin}
              onfocusout={roving.onfocusout}
            >
              {#each runs as run, index (run.runId)}
                {@const transition = transitionOf(run.startedEvent)}
                {#if index > 0 && transition}
                  <RunTransition {transition} />
                {/if}
                <RunCard
                  {run}
                  namespace={chain.identity.namespace}
                  controller={chain.controllers.get(run.runId)}
                  cardLoad={chain.cardLoadOf(run.runId)}
                  {transition}
                  width={widths[index] ?? MIN_CARD_WIDTH}
                  {now}
                  selected={run.runId === selectedRunId}
                  isLatest={run.runId === chain.latestRunId}
                  {live}
                  tabIndex={roving.tabIndex(run.runId)}
                  bind:buttonElement={cardElements[run.runId]}
                  onSelect={() => onSelect(run.runId)}
                  onRetry={() => chain.retryCard(run.runId)}
                />
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
            <Tooltip text={jumpTooltip} topLeft usePortal class="flex w-full">
              <button
                type="button"
                aria-label={jumpLabel}
                aria-disabled={live ? 'true' : undefined}
                onclick={jumpToLive}
                class="relative flex w-full items-center justify-center rounded border border-brand bg-surface-primary text-brand shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press aria-disabled:cursor-not-allowed aria-disabled:opacity-disabled aria-disabled:shadow-sm"
              >
                <IconArrowRightToLine />
                {#if newerArrived && !live}
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
