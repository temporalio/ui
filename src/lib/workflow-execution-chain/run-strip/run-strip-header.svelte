<script lang="ts">
  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Button } from '$lib/io/button';
  import { IconWarning } from '$lib/io/icon';

  interface Props {
    runCount: number;
    nextRunCheckFailed: boolean;
    onRetryNextRunCheck: () => void;
  }

  let { runCount, nextRunCheckFailed, onRetryNextRunCheck }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
  <div class="flex items-center gap-2">
    <h2 class="flex items-center gap-2">
      <span class="text-xl font-medium"
        >{translate('workflows.run-details')}</span
      >
      {#if runCount}
        <span class="text-base text-secondary"
          >{translate('workflows.runs-loaded', { count: runCount })}</span
        >
      {/if}
    </h2>
    <EventHistoryLegend />
  </div>
  <div
    class="flex items-center gap-2 text-xs text-secondary"
    data-testid="run-strip-status"
  >
    {#if nextRunCheckFailed}
      <span class="flex items-center gap-1 text-danger"
        ><IconWarning />{translate('workflows.next-run-check-failed')}</span
      >
      <Button size="xs" colorScheme="secondary" onclick={onRetryNextRunCheck}
        >{translate('common.retry')}</Button
      >
    {/if}
  </div>
</div>
