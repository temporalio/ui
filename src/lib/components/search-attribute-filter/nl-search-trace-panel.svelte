<script lang="ts">
  import { prefersReducedMotion } from 'svelte/motion';
  import { fly } from 'svelte/transition';

  import { tick } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import type { BadgeColorScheme } from '$lib/io/badge/badge.svelte';
  import {
    IconCheckCircle,
    IconCheckmark,
    IconChevronLeft,
    IconChevronRight,
    IconClose,
    IconExclamationCircle,
  } from '$lib/io/icon';
  import type { NLSearchTraceStep } from '$lib/services/nl-search-service';
  import type { NLSearchTrace } from '$lib/stores/nl-search-trace';
  import {
    answerLabel,
    carouselWindow,
    choiceBranches,
    filterLabel,
    formatPercent,
    type NLSearchTraceBranch,
    noulBranches,
    orderedStages,
    outcomeLabel,
    outcomeReason,
    outcomeTone,
    questionLabel,
    stageKicker,
    stepReason,
  } from '$lib/utilities/nl-search-trace';

  interface Props {
    id: string;
    history: NLSearchTrace[];
    onClose: () => void;
    onSelect?: (entry: NLSearchTrace) => void;
  }

  let { id, history, onClose, onSelect }: Props = $props();

  let chosen = $state<{ key: string; latestKey: string } | null>(null);

  const latest = $derived(history.at(-1) ?? null);
  const current = $derived(
    (chosen && chosen.latestKey === latest?.key
      ? history.find((entry) => entry.key === chosen?.key)
      : undefined) ?? latest,
  );
  const currentIndex = $derived(
    current ? history.findIndex((entry) => entry.key === current.key) : -1,
  );
  const carousel = $derived(carouselWindow(history.length, currentIndex));

  const select = (index: number) => {
    const entry = history[index];
    if (!entry || entry.key === current?.key) return;
    chosen = { key: entry.key, latestKey: latest?.key ?? '' };
    onSelect?.(entry);
  };

  let track = $state<HTMLDivElement>();

  const step = async (direction: number) => {
    select(currentIndex + direction);
    await tick();
    track
      ?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
      ?.focus();
  };

  const trace = $derived(
    current ? orderedStages(current.response.trace) : { stages: [], other: [] },
  );
  const usedCount = $derived(
    current
      ? current.response.trace.filter((step) => step.outcome === 'kept').length
      : 0,
  );

  const TAKEN: Record<BadgeColorScheme, string> = {
    success: 'border-success bg-surface-success text-primary',
    warning: 'border-warning bg-surface-warning text-primary',
    danger: 'border-danger bg-surface-danger text-primary',
    error: 'border-danger bg-surface-danger text-primary',
    info: 'border-information bg-surface-information text-primary',
    accent: 'border-information bg-surface-information text-primary',
    neutral: 'border-primary bg-surface-secondary text-primary',
  };

  const SCORE_TEXT: Record<BadgeColorScheme, string> = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    error: 'text-danger',
    info: 'text-information',
    accent: 'text-information',
    neutral: 'text-secondary',
  };

  const FILLS: Record<BadgeColorScheme, string> = {
    success: 'bg-content-success',
    warning: 'bg-content-warning',
    danger: 'bg-content-danger',
    error: 'bg-content-danger',
    info: 'bg-content-brand',
    accent: 'bg-content-brand',
    neutral: 'bg-content-secondary',
  };

  const width = (value: number) =>
    `${Math.min(100, Math.max(0, value * 100))}%`;

  const reveal = (index: number) => ({
    y: 8,
    duration: prefersReducedMotion.current ? 0 : 220,
    delay: prefersReducedMotion.current ? 0 : index * 70,
  });

  const meterText = (step: NLSearchTraceStep, score: number) =>
    step.threshold === null
      ? translate('workflows.nl-search-trace-score-value', {
          score: formatPercent(score),
        })
      : translate('workflows.nl-search-trace-score-value-threshold', {
          score: formatPercent(score),
          threshold: formatPercent(step.threshold),
        });

  const branchesFor = (step: NLSearchTraceStep) =>
    step.kind === 'noul' ? noulBranches(step) : choiceBranches(step);
</script>

{#snippet branch(item: NLSearchTraceBranch)}
  <div
    class="flex min-w-0 flex-col gap-1 border border-t-2 px-3 py-2 {item.taken
      ? TAKEN[item.tone]
      : 'border-primary bg-surface-primary text-secondary'}"
  >
    <span class="font-mono text-2xs [overflow-wrap:anywhere]">{item.label}</span
    >
    <span
      class="flex min-w-0 items-center gap-1 text-sm font-medium [overflow-wrap:anywhere]"
    >
      {#if item.taken}
        <IconCheckmark width={12} height={12} />
        <span class="sr-only"
          >{translate('workflows.nl-search-trace-branch-taken')}:</span
        >
      {/if}
      {item.destination}
    </span>
  </div>
{/snippet}

{#snippet stage(step: NLSearchTraceStep, index: number)}
  {@const tone = outcomeTone(step.outcome)}
  {@const branches = branchesFor(step)}
  <li class="relative min-w-0" in:fly={reveal(index)}>
    <span
      class="absolute -left-8 top-4 flex size-5 items-center justify-center rounded-sm border border-primary bg-surface-primary font-mono text-2xs text-secondary"
      aria-hidden="true">{index + 1}</span
    >
    <section
      class="flex flex-col gap-3 rounded border border-primary bg-surface-secondary p-4"
      aria-label={questionLabel(step)}
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p
            class="break-words font-mono text-2xs uppercase tracking-widest text-secondary"
          >
            {stageKicker(step)}
          </p>
          <h4 class="mt-1 break-words text-base font-medium">
            {questionLabel(step)}
          </h4>
        </div>
        <strong
          class="shrink-0 font-mono text-2xl tabular-nums {SCORE_TEXT[tone]}"
        >
          {step.score === null
            ? translate('workflows.nl-search-trace-no-score')
            : formatPercent(step.score)}
        </strong>
      </div>

      {#if step.score !== null}
        <div>
          <div
            class="relative h-2.5 rounded-sm border border-primary bg-surface-primary"
            role="meter"
            aria-label={translate('workflows.nl-search-trace-score')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(step.score * 100)}
            aria-valuetext={meterText(step, step.score)}
          >
            <span
              class="absolute inset-y-0 left-0 rounded-sm {FILLS[tone]}"
              style:width={width(step.score)}
            ></span>
            {#if step.threshold !== null}
              <span
                class="absolute -inset-y-1.5 w-px bg-content-primary"
                style:left={width(step.threshold)}
                aria-hidden="true"
              ></span>
            {/if}
          </div>
          <div
            class="mt-1 flex justify-between gap-2 font-mono text-2xs tabular-nums text-secondary"
            aria-hidden="true"
          >
            <span>{formatPercent(0)}</span>
            {#if step.threshold !== null}
              <span>
                {translate('workflows.nl-search-trace-bar', {
                  threshold: formatPercent(step.threshold),
                })}
              </span>
            {/if}
            <span>{formatPercent(1)}</span>
          </div>
        </div>
      {/if}

      {#if branches.length > 0}
        <div
          class="branch-grid grid gap-2"
          class:three={branches.length === 3}
          class:two={branches.length === 2}
        >
          {#each branches as item (item.key)}
            {@render branch(item)}
          {/each}
        </div>
      {/if}

      <div class="flex flex-wrap items-center gap-2">
        <Badge text={outcomeLabel(step.outcome)} colorScheme={tone} size="sm" />
        <p class="min-w-0 grow text-sm text-secondary">
          {current
            ? stepReason(step, current.response.trace)
            : outcomeReason(step)}
        </p>
      </div>

      {#if step.filters.length > 0}
        <ul class="flex flex-wrap gap-1">
          {#each step.filters as filter, filterIndex (filterIndex)}
            <li
              class="break-all rounded border border-primary bg-surface-primary px-1.5 py-0.5 font-mono text-2xs"
            >
              {filterLabel(filter)}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </li>
{/snippet}

{#snippet finalNode()}
  {#if current}
    {@const understood = current.response.understood}
    {@const FinalIcon = understood ? IconCheckCircle : IconExclamationCircle}
    <section
      class="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded border p-4 {understood
        ? 'border-success bg-surface-success'
        : 'border-warning bg-surface-warning'}"
    >
      <span class={understood ? 'text-success' : 'text-warning'}>
        <FinalIcon width={20} height={20} />
      </span>
      <div class="flex min-w-0 flex-col gap-2">
        <p class="font-mono text-2xs uppercase tracking-widest text-secondary">
          {translate('workflows.nl-search-trace-final')}
        </p>
        <h4 class="text-base font-medium">
          {understood
            ? translate('workflows.nl-search-trace-query-built')
            : translate('workflows.nl-search-trace-not-understood')}
        </h4>
        {#if current.response.filters.length > 0}
          <ul class="flex flex-wrap gap-1">
            {#each current.response.filters as filter, filterIndex (filterIndex)}
              <li
                class="break-all rounded border border-primary bg-surface-primary px-1.5 py-0.5 font-mono text-2xs"
              >
                {filterLabel(filter)}
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-sm">
            {translate('workflows.nl-search-trace-no-filters')}
          </p>
        {/if}
      </div>
    </section>
  {/if}
{/snippet}

<aside
  {id}
  class="nl-trace flex max-h-[80vh] min-h-0 w-full flex-col border-t border-primary bg-surface-primary md:max-h-none md:w-[30rem] md:shrink-0 md:border-l"
  aria-labelledby="{id}-title"
>
  <header
    class="flex items-start justify-between gap-2 border-b border-primary px-4 py-3"
  >
    <div class="min-w-0">
      <p class="font-mono text-2xs uppercase tracking-widest text-secondary">
        {translate('workflows.nl-search-trace-kicker')}
      </p>
      <h3 id="{id}-title" class="mt-1 text-base font-medium">
        {translate('workflows.nl-search-trace-title')}
      </h3>
    </div>
    <Button
      variant="ghost"
      size="xs"
      aria-label={translate('workflows.nl-search-trace-close')}
      onclick={onClose}
    >
      <IconClose />
    </Button>
  </header>

  <div class="flex min-h-0 grow flex-col overflow-auto">
    {#if !current}
      <p class="p-4 text-sm text-secondary">
        {translate('workflows.nl-search-trace-empty')}
      </p>
    {:else}
      {#if history.length > 1}
        <section
          class="flex items-center gap-1 border-b border-primary px-2 py-3"
          aria-label={translate('workflows.nl-search-trace-history-label')}
        >
          <Button
            variant="ghost"
            size="xs"
            class="shrink-0"
            aria-label={translate('workflows.nl-search-trace-previous')}
            disabled={currentIndex <= 0}
            onclick={() => select(currentIndex - 1)}
          >
            <IconChevronLeft />
          </Button>
          <div
            class="carousel relative h-24 min-w-0 grow overflow-hidden"
            bind:this={track}
          >
            {#each carousel.slots as slot (history[slot.index].key)}
              {@const entry = history[slot.index]}
              {@const selected = slot.offset === 0}
              <button
                type="button"
                class="carousel-card absolute left-1/2 top-1 flex h-[5.5rem] w-32 flex-col justify-between rounded border p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary {selected
                  ? 'border-interactive-primary bg-surface-secondary'
                  : 'border-primary bg-surface-primary'}"
                style:--offset={slot.offset}
                style:--scale={slot.scale}
                style:--fade={slot.opacity}
                style:z-index={10 - Math.abs(slot.offset)}
                aria-pressed={selected}
                aria-label={translate(
                  'workflows.nl-search-trace-search-number',
                  {
                    number: slot.index + 1,
                    count: history.length,
                    text: entry.text,
                  },
                )}
                onclick={() => select(slot.index)}
                onkeydown={(event) => {
                  if (event.key === 'ArrowLeft') step(-1);
                  if (event.key === 'ArrowRight') step(1);
                }}
              >
                <span
                  class="font-mono text-2xs tabular-nums text-secondary"
                  aria-hidden="true">#{slot.index + 1}</span
                >
                <span
                  class="line-clamp-2 break-words text-xs"
                  aria-hidden="true">{entry.text}</span
                >
                <span
                  class="font-mono text-2xs tabular-nums {entry.response
                    .understood
                    ? 'text-success'
                    : 'text-warning'}"
                  aria-hidden="true"
                >
                  {entry.response.understood
                    ? formatPercent(entry.response.confidence)
                    : translate('workflows.nl-search-trace-not-understood')}
                </span>
              </button>
            {/each}
          </div>
          <Button
            variant="ghost"
            size="xs"
            class="shrink-0"
            aria-label={translate('workflows.nl-search-trace-next')}
            disabled={currentIndex >= history.length - 1}
            onclick={() => select(currentIndex + 1)}
          >
            <IconChevronRight />
          </Button>
        </section>
      {/if}

      {#key current.key}
        <article class="flex flex-col gap-4 p-4" aria-labelledby="{id}-search">
          <header class="flex flex-col gap-2 border-b border-primary pb-4">
            <h3 id="{id}-search" class="break-words text-xl font-medium">
              “{current.text}”
            </h3>
            <div class="flex flex-wrap items-center gap-2">
              <Badge
                text={current.response.understood
                  ? translate('workflows.nl-search-trace-understood')
                  : translate('workflows.nl-search-trace-not-understood')}
                colorScheme={current.response.understood
                  ? 'success'
                  : 'warning'}
              />
              {#if current.response.understood}
                <span class="font-mono text-xs tabular-nums text-secondary">
                  {translate('workflows.nl-search-trace-confidence', {
                    confidence: formatPercent(current.response.confidence),
                  })}
                </span>
              {/if}
            </div>
          </header>

          {#if current.response.trace.length === 0}
            <p
              class="rounded border border-primary bg-surface-secondary p-3 text-sm text-secondary"
            >
              {translate('workflows.nl-search-trace-unavailable')}
            </p>
            {@render finalNode()}
          {:else if trace.stages.length > 0}
            <div class="relative pl-8">
              <span
                class="absolute bottom-4 left-2.5 top-4 border-l border-primary"
                aria-hidden="true"
              ></span>
              <ol
                class="flex flex-col gap-4"
                aria-label={translate('workflows.nl-search-trace-stages')}
              >
                {#each trace.stages as step, index (step.id)}
                  {@render stage(step, index)}
                {/each}
                <li
                  class="relative min-w-0"
                  in:fly={reveal(trace.stages.length)}
                >
                  <span
                    class="absolute -left-8 top-4 flex size-5 items-center justify-center rounded-sm border font-mono text-2xs {current
                      .response.understood
                      ? 'border-success bg-surface-success text-success'
                      : 'border-warning bg-surface-warning text-warning'}"
                    aria-hidden="true">{trace.stages.length + 1}</span
                  >
                  {@render finalNode()}
                </li>
              </ol>
            </div>
          {:else}
            {@render finalNode()}
          {/if}

          {#if trace.other.length > 0}
            <details class="pl-8">
              <summary
                class="cursor-pointer rounded text-sm text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
              >
                {translate('workflows.nl-search-trace-more', {
                  count: trace.other.length,
                })}
              </summary>
              <ul class="mt-2 flex flex-col divide-y divide-primary">
                {#each trace.other as step (step.id)}
                  {@const answer = answerLabel(step)}
                  <li class="flex items-center justify-between gap-3 py-2">
                    <span class="min-w-0">
                      <span class="block break-words text-sm">
                        {questionLabel(step)}
                      </span>
                      {#if answer !== null}
                        <span
                          class="block break-words font-mono text-2xs text-secondary"
                        >
                          {answer}
                        </span>
                      {/if}
                    </span>
                    <Badge
                      text={outcomeLabel(step.outcome)}
                      colorScheme={outcomeTone(step.outcome)}
                      size="sm"
                    />
                  </li>
                {/each}
              </ul>
            </details>
          {/if}

          {#if current.response.trace.length > 0}
            <dl class="stats grid gap-1 pl-8">
              <div class="rounded border border-primary p-3">
                <dt
                  class="font-mono text-2xs uppercase tracking-widest text-secondary"
                >
                  {translate('workflows.nl-search-trace-questions')}
                </dt>
                <dd class="mt-1 font-mono text-sm tabular-nums">
                  {current.response.trace.length}
                </dd>
              </div>
              <div class="rounded border border-primary p-3">
                <dt
                  class="font-mono text-2xs uppercase tracking-widest text-secondary"
                >
                  {translate('workflows.nl-search-trace-used')}
                </dt>
                <dd class="mt-1 font-mono text-sm tabular-nums">{usedCount}</dd>
              </div>
              <div class="rounded border border-primary p-3">
                <dt
                  class="font-mono text-2xs uppercase tracking-widest text-secondary"
                >
                  {translate('workflows.nl-search-trace-filters-count')}
                </dt>
                <dd class="mt-1 font-mono text-sm tabular-nums">
                  {current.response.filters.length}
                </dd>
              </div>
            </dl>
          {/if}
        </article>
      {/key}
    {/if}
  </div>
</aside>

<style>
  .nl-trace {
    container: nl-trace / inline-size;
  }

  .branch-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .carousel-card > * {
    opacity: var(--fade);
    transition: opacity 200ms ease-out;
  }

  .carousel-card {
    transform: translateX(calc(-50% + var(--offset) * 5.75rem))
      scale(var(--scale));
    transition: transform 200ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .carousel-card,
    .carousel-card > * {
      transition: none;
    }
  }

  .stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @container nl-trace (min-width: 24rem) {
    .branch-grid.two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @container nl-trace (min-width: 40rem) {
    .branch-grid.three {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
