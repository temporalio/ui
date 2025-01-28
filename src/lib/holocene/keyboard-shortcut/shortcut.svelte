<script lang="ts">
  import type { Snippet } from 'svelte';

  import Tooltip from '$lib/holocene/tooltip.svelte';

  import ArrowDown from './arrow-down.svelte';
  import ArrowLeft from './arrow-left.svelte';
  import ArrowRight from './arrow-right.svelte';
  import ArrowUp from './arrow-up.svelte';

  interface Props {
    tooltipText?: string;
    arrow?: 'up' | 'down' | 'left' | 'right';
    title: string;
    children?: Snippet;
  }

  let { tooltipText = '', arrow, title, children }: Props = $props();

  const ArrowComponents = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
  };

  const ArrowComponent = ArrowComponents[arrow];
</script>

<Tooltip text={tooltipText} hide={!tooltipText} top>
  <kbd class="shortcut">
    {#if arrow}
      <ArrowComponent {title} />
    {:else}
      {@render children?.()}
    {/if}
  </kbd>
</Tooltip>

<style lang="postcss">
  .shortcut {
    @apply inline-flex w-auto min-w-[32px] items-center justify-center border border-slate-100 px-1 py-1.5 text-xs font-semibold text-white dark:border-slate-500 dark:bg-slate-600 dark:text-slate-100;
  }
</style>
