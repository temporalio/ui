<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { IconWarning } from '$lib/io/icon';

  import { MIN_CARD_WIDTH } from '../card-layout';

  interface Props {
    runId: string;
    onRetry: () => void;
  }

  let { runId, onRetry }: Props = $props();

  const messageId = $props.id();
</script>

<div
  class="flex shrink-0 flex-col gap-2 rounded-md border border-dashed border-danger bg-surface-secondary p-2"
  style:width="{MIN_CARD_WIDTH}px"
  data-testid="run-card-failed"
  data-run-id={runId}
>
  <span class="flex min-w-0 items-center gap-2 text-xs">
    <span class="truncate font-mono text-primary">{runId}</span>
    <button
      type="button"
      aria-describedby={messageId}
      class="ml-auto shrink-0 rounded px-1 text-danger underline hover:bg-interactive-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press"
      onclick={onRetry}
    >
      {translate('common.retry')}
    </button>
  </span>
  <span class="h-1.5 w-full rounded-full border border-dashed border-danger"
  ></span>
  <span
    id={messageId}
    class="flex min-h-6 items-center gap-1 text-xs text-danger"
  >
    <IconWarning />{translate('workflows.couldnt-load-run')}
  </span>
</div>
