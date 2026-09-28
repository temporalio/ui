<script lang="ts">
  import { untrack } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import { buildHistoryReviewItems } from '$lib/services/history-review-service';
  import {
    historyReview,
    toHistoryReviewRunKey,
  } from '$lib/services/history-review-state.svelte';
  import { showAllReviewedEvents } from '$lib/stores/event-view';
  import { workflowRun } from '$lib/stores/workflow-run';

  interface Props {
    fetchComplete: boolean;
    class?: string;
  }

  let { fetchComplete, class: className = '' }: Props = $props();

  const review = historyReview;
  const { workflow } = $derived($workflowRun);
  const namespace = $derived(page.params.namespace ?? '');
  const showAll = $derived($showAllReviewedEvents === 'on');
  const loading = $derived(review.status === 'loading');

  const runKey = $derived(
    toHistoryReviewRunKey({
      namespace,
      workflowId: workflow?.id ?? '',
      runId: workflow?.runId ?? '',
    }),
  );

  $effect(() => {
    const key = runKey;
    untrack(() => review.ensureRun(key));
  });

  const statusMessage = $derived.by(() => {
    if (loading) return translate('events.history-review-loading');
    if (review.status === 'error') return review.errorMessage;
    if (review.status !== 'done' || !review.summary) return '';
    if (review.summary.routine === 0) {
      return translate('events.history-review-no-routine');
    }
    return translate('events.history-review-summary', review.summary);
  });

  const onReview = () => {
    if (!workflow || loading) return;
    review.review({
      namespace,
      workflowType: workflow.name ?? '',
      workflowStatus: String(workflow.status ?? ''),
      items: buildHistoryReviewItems({
        events: eventBuffer.events,
        groups: eventBuffer.groupsWithoutWorkflowTasks,
      }),
    });
  };

  const onShowAllChange = (event: Event) => {
    $showAllReviewedEvents = (event.currentTarget as HTMLInputElement).checked
      ? 'on'
      : 'off';
  };
</script>

<div
  class="flex flex-wrap items-center gap-x-4 gap-y-2 {className}"
  data-testid="history-review-toolbar"
>
  <div class="flex items-center gap-2">
    <Button
      size="sm"
      variant="secondary"
      data-testid="history-review-button"
      {loading}
      disabled={!fetchComplete || loading}
      onclick={onReview}
    >
      {review.hasReview
        ? translate('events.history-review-again')
        : translate('events.history-review-button')}
    </Button>
    <Badge colorScheme="warning" text={translate('common.experimental')} />
  </div>
  {#if review.hasReview}
    <ToggleSwitch
      id="history-review-show-all"
      data-testid="history-review-show-all"
      label={translate('events.history-review-show-all')}
      checked={showAll}
      onchange={onShowAllChange}
    />
    <Button
      size="sm"
      variant="ghost"
      data-testid="history-review-clear"
      onclick={() => review.clear()}
    >
      {translate('events.history-review-clear')}
    </Button>
  {/if}
  <p
    aria-live="polite"
    data-testid="history-review-status"
    class="min-w-0 break-words text-sm"
    class:sr-only={!statusMessage}
    class:text-danger={review.status === 'error'}
    class:text-secondary={review.status !== 'error'}
  >
    {statusMessage}
  </p>
</div>
