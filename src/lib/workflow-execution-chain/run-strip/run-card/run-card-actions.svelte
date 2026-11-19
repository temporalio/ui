<script lang="ts">
  import { twJoin, twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import { IconArrowUpRight, IconCheckmark, IconCopy } from '$lib/io/icon';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  interface Props {
    runId: string;
    runHref: string;
    tabIndex: 0 | -1;
    canRetry: boolean;
    onRetry: () => void;
  }

  let { runId, runHref, tabIndex, canRetry, onRetry }: Props = $props();

  const { copy, copied } = copyToClipboard();

  const actionClasses = twJoin(
    'flex size-6 items-center justify-center rounded text-sm text-secondary',
    'hover:bg-interactive-secondary-hover hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press',
  );
</script>

<div
  class="pointer-events-none absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md border border-secondary bg-surface-primary p-0.5 opacity-0 shadow-sm transition-opacity group-focus-within/run:pointer-events-auto group-focus-within/run:opacity-100 group-hover/run:pointer-events-auto group-hover/run:opacity-100"
>
  <button
    type="button"
    tabindex={tabIndex}
    class={actionClasses}
    aria-label={translate('workflows.copy-run-id')}
    title={$copied
      ? translate('common.copied')
      : translate('workflows.copy-run-id')}
    onclick={(event) => copy(event, runId)}
  >
    {#if $copied}
      <IconCheckmark class="text-static-success" />
    {:else}
      <IconCopy />
    {/if}
  </button>
  <a
    href={runHref}
    tabindex={tabIndex}
    class={actionClasses}
    aria-label={translate('workflows.go-to-run-page')}
    title={translate('workflows.go-to-run-page')}
  >
    <IconArrowUpRight />
  </a>
</div>
{#if canRetry}
  <button
    type="button"
    tabindex={tabIndex}
    class={twMerge(
      actionClasses,
      'absolute bottom-2 right-2 h-6 w-auto px-1.5 text-xs text-danger underline',
    )}
    onclick={onRetry}
  >
    {translate('common.retry')}
  </button>
{/if}
