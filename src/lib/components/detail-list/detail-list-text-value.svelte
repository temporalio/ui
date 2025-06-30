<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import DetailListValue from './detail-list-value.svelte';

  interface Props {
    copyable?: boolean;
    copyableText?: string;
    text: string;
    tooltipText?: string;
    isBadge?: boolean;
    iconName?: IconName | undefined;
  }

  let { copyable, copyableText, text, tooltipText, isBadge, iconName }: Props =
    $props();
</script>

{#snippet content()}
  <div
    class="flex select-all items-center gap-1 truncate rounded-sm"
    class:surface-subtle={isBadge}
  >
    {#if iconName}
      <Icon name={iconName} class="shrink-0" />
    {/if}
    {text}
  </div>
{/snippet}

<DetailListValue {copyable} {copyableText}>
  {#if tooltipText}
    <Tooltip text={tooltipText} top class="min-w-0">
      {@render content()}
    </Tooltip>
  {:else}
    {@render content()}
  {/if}
</DetailListValue>
