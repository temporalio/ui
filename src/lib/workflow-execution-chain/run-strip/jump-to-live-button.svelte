<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { IconArrowRightToLine } from '$lib/io/icon';

  import EndCap from './end-cap.svelte';

  interface Props {
    live: boolean;
    latestRunOpen: boolean;
    chainClosed: boolean;
    newerRunArrived: boolean;
    contentScrolledUnder: boolean;
    onJumpToLive: () => void;
  }

  let {
    live,
    latestRunOpen,
    chainClosed,
    newerRunArrived,
    contentScrolledUnder,
    onJumpToLive,
  }: Props = $props();

  const label = $derived(
    latestRunOpen || !chainClosed
      ? translate('workflows.jump-to-live')
      : translate('workflows.view-latest-run'),
  );
  const tooltip = $derived.by(() => {
    if (!live) {
      return label;
    }
    return latestRunOpen
      ? translate('workflows.viewing-live')
      : translate('workflows.viewing-latest-run');
  });

  const jumpToLive = () => {
    if (live) {
      return;
    }
    onJumpToLive();
  };
</script>

<EndCap
  side="end"
  {contentScrolledUnder}
  {tooltip}
  {label}
  disabled={live}
  onclick={jumpToLive}
>
  <IconArrowRightToLine />
  {#if newerRunArrived}
    <span
      class="absolute right-1 top-1 size-2 rounded-full bg-interactive-primary motion-safe:animate-pulse"
      data-testid="newer-run-indicator"
    ></span>
  {/if}
</EndCap>
