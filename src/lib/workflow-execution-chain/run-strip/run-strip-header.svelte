<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Button } from '$lib/io/button';
  import { IconFlag, IconInfo, IconTarget, IconWarning } from '$lib/io/icon';

  interface Props {
    runCount: number;
    hasDiscoveryError: boolean;
    chainClosed: boolean;
    selectedOutOfView: boolean;
    onRetryDiscovery: () => void;
    onScrollToSelected: () => void;
  }

  let {
    runCount,
    hasDiscoveryError,
    chainClosed,
    selectedOutOfView,
    onRetryDiscovery,
    onScrollToSelected,
  }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
  <h2 class="flex items-center gap-2">
    <span class="text-xl font-medium">{translate('workflows.run-details')}</span
    >
    {#if runCount}
      <span class="text-base text-secondary"
        >{translate('workflows.runs-loaded', { count: runCount })}</span
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
    {#if hasDiscoveryError}
      <span class="flex items-center gap-1 text-danger"
        ><IconWarning />{translate('workflows.discovery-error')}</span
      >
      <Button size="xs" colorScheme="secondary" onclick={onRetryDiscovery}
        >{translate('common.retry')}</Button
      >
    {:else if chainClosed}
      <span class="flex items-center gap-1"
        ><IconFlag />{translate('workflows.chain-closed')}</span
      >
    {/if}
    {#if selectedOutOfView}
      <Button
        size="xs"
        colorScheme="ghost"
        LeadingIcon={IconTarget}
        onclick={onScrollToSelected}
        >{translate('workflows.scroll-to-selected')}</Button
      >
    {/if}
  </div>
</div>
