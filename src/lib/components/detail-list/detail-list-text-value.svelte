<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
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
    badgeType?: BadgeType;
    iconName?: IconName | undefined;
  }

  let {
    copyable,
    text,
    copyableText = text,
    tooltipText,
    iconName,
    isBadge = false,
    badgeType = 'default',
  }: Props = $props();
</script>

{#snippet content()}
  {#if isBadge}
    <Badge type={badgeType}>
      {text}
    </Badge>
  {:else}
    <div class="flex select-all items-center gap-1 truncate rounded-sm">
      {#if iconName}
        <Icon name={iconName} class="shrink-0" />
      {/if}
      <span class="truncate">{text}</span>
    </div>
  {/if}
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
