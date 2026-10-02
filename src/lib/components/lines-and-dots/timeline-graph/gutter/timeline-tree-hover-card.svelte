<script lang="ts">
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  type Props = {
    id: string;
    /** Names what the value is, e.g. "Run ID", where it isn't obvious. */
    title?: string;
    value: string;
    /** Only text the row hides is worth copying; its own label isn't. */
    copyable?: boolean;
    /** Opens the row's event in the details panel. */
    onViewDetails?: () => void;
    /** Where the row's label starts, so the card's text sits right on it. */
    labelStartPx: number;
  };

  const {
    id,
    title,
    value,
    copyable = true,
    onViewDetails,
    labelStartPx,
  }: Props = $props();

  const { copy, copied } = copyToClipboard();
</script>

<!-- Shown while its row is hovered or focused, lined up over the row's own
     label. Clicks fall through to the row underneath, except on the card's
     own controls. -->
<div
  {id}
  class="hover-card pointer-events-none absolute top-1/2 z-20 flex items-center gap-1 whitespace-nowrap rounded-md border border-primary bg-background-primary py-0.5 pl-2 pr-0.5 text-xs shadow-md"
  style:left="{labelStartPx - 9}px"
  data-testid="timeline-tree-hover-card"
>
  {#if title}
    <span class="text-secondary">{title}:</span>
  {/if}
  <span class="text-primary">{value}</span>
  {#if copyable}
    <CopyButton
      class="pointer-events-auto"
      copied={$copied}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      onclick={(event) => copy(event, value)}
    />
  {/if}
  {#if onViewDetails}
    <span class="mx-1 h-3 w-px bg-border-primary" aria-hidden="true"></span>
    <button
      type="button"
      class="pointer-events-auto rounded px-1.5 py-1 text-brand hover:bg-interactive-tertiary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
      data-testid="timeline-tree-view-details"
      onclick={(event) => {
        event.stopPropagation();
        onViewDetails();
      }}
    >
      {translate('workflows.timeline-view-event-details')}
    </button>
  {/if}
</div>

<style lang="postcss">
  .hover-card {
    visibility: hidden;
    opacity: 0;
    transform: translateY(-50%);
    transition:
      opacity 150ms ease-in-out,
      visibility 0s linear 150ms;
  }

  /* A short wait before showing keeps a sweep down the tree from flashing a
     card on every row; leaving hides it straight away. Keyboard focus keeps
     it open, but focus left behind by a click doesn't. */
  :global(.group\/row:hover) .hover-card,
  :global(.group\/row:has(:focus-visible)) .hover-card {
    visibility: visible;
    opacity: 1;
    transition:
      opacity 150ms ease-in-out 200ms,
      visibility 0s linear 200ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .hover-card,
    :global(.group\/row:hover) .hover-card,
    :global(.group\/row:has(:focus-visible)) .hover-card {
      transition: none;
    }
  }
</style>
