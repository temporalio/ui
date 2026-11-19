<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { createRovingFocusState } from '$lib/utilities/roving-focus';

  import type { WorkflowExecutionChain } from '../workflow-execution-chain.svelte';
  import { MIN_CARD_WIDTH } from './card-layout';
  import { RunCard, RunCardFailed, RunCardSkeleton } from './run-card';
  import { transitionOf } from './transitions';

  import { preferredScrollBehavior } from './run-strip-scroll.svelte';
  import RunTransition from './run-transition.svelte';

  interface Props {
    chain: WorkflowExecutionChain;
    cardWidths: readonly number[];
    now: number;
    selectedRunId: string | null;
    live: boolean;
    onSelect: (runId: string) => void;
  }

  let { chain, cardWidths, now, selectedRunId, live, onSelect }: Props =
    $props();

  const SKELETON_CARDS = [0, 1, 2, 3];

  const descriptionId = $props.id();
  const cardElements: Record<string, HTMLButtonElement | null> = {};

  const runs = $derived(chain.runs);
  const runIds = $derived(runs.map((run) => run.runId));
  const rovingFocus = createRovingFocusState<string>({
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
</script>

{#if runs.length === 0}
  {#each SKELETON_CARDS as card (card)}
    <RunCardSkeleton />
  {/each}
{:else}
  {#if chain.failedOlderRunId}
    <RunCardFailed
      runId={chain.failedOlderRunId}
      onRetry={() => chain.retryOlderRun()}
    />
  {:else if chain.walking}
    <RunCardSkeleton data-testid="run-card-loading-older" aria-hidden="true" />
  {/if}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="group"
    aria-label={translate('workflows.runs-group-label', {
      count: runs.length,
    })}
    aria-describedby={descriptionId}
    class="flex items-stretch gap-1.5"
    onkeydown={rovingFocus.onkeydown}
    onfocusin={rovingFocus.onfocusin}
    onfocusout={rovingFocus.onfocusout}
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
        summary={chain.summaries.get(run.runId)}
        cardLoad={chain.cardLoadOf(run.runId)}
        {transition}
        width={cardWidths[index] ?? MIN_CARD_WIDTH}
        {now}
        selected={run.runId === selectedRunId}
        isLatest={run.runId === chain.latestRunId}
        {live}
        stale={chain.isStatusStale(run.runId)}
        tabIndex={rovingFocus.tabIndex(run.runId)}
        bind:buttonElement={cardElements[run.runId]}
        onSelect={() => onSelect(run.runId)}
        onRetry={() => chain.retryCard(run.runId)}
        onRetryStatus={() => chain.retryStatus(run.runId)}
      />
    {/each}
  </div>
  {#if chain.pendingSuccessorRunId}
    <RunCardSkeleton data-testid="run-card-pending" aria-hidden="true" />
  {:else if chain.failedSuccessorRunId}
    <RunCardFailed
      runId={chain.failedSuccessorRunId}
      onRetry={() => chain.retrySuccessorRun()}
    />
  {/if}
{/if}
<span id={descriptionId} class="sr-only"
  >{translate('workflows.runs-group-description')}</span
>
