<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
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

  let { copyable, copyableText, text, tooltipText, isBadge }: Props = $props();
</script>

{#snippet content()}
  <span
    class="w-fit select-all truncate rounded-sm"
    class:surface-subtle={isBadge}>{text}</span
  >
{/snippet}

<DetailListValue {copyable} {copyableText}>
  {#if tooltipText}
    <Tooltip text={tooltipText} top>
      {@render content()}
    </Tooltip>
  {:else}
    {@render content()}
  {/if}
</DetailListValue>
