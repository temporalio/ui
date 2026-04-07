<script lang="ts">
  import type { ClassNameValue } from 'tailwind-merge';

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
    tooltipWidth?: number;
    isBadge?: boolean;
    badgeType?: BadgeType;
    iconName?: IconName | undefined;
    iconPosition?: 'leading' | 'trailing';
    class?: ClassNameValue;
  }

  let {
    copyable,
    text,
    copyableText = text,
    tooltipText,
    tooltipWidth = 256,
    iconName,
    iconPosition = 'leading',
    isBadge = false,
    badgeType = 'default',
    class: className = '',
  }: Props = $props();
</script>

{#snippet content()}
  {#if isBadge}
    <Badge type={badgeType}>
      {text}
    </Badge>
  {:else}
    <div class="flex select-all items-center gap-1 truncate rounded-sm">
      {#if iconName && iconPosition === 'leading'}
        <Icon name={iconName} class="shrink-0" />
      {/if}
      <span class="truncate">{text}</span>
      {#if iconName && iconPosition === 'trailing'}
        <Icon name={iconName} class="shrink-0" />
      {/if}
    </div>
  {/if}
{/snippet}

<DetailListValue class={className} {copyable} {copyableText}>
  {#if tooltipText}
    <Tooltip text={tooltipText} top width={tooltipWidth} class="min-w-0">
      {@render content()}
    </Tooltip>
  {:else}
    {@render content()}
  {/if}
</DetailListValue>
