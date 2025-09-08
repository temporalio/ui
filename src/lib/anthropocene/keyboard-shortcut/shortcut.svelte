<script lang="ts">
  import Tooltip from '$lib/anthropocene/tooltip.svelte';

  import ArrowDown from './arrow-down.svelte';
  import ArrowLeft from './arrow-left.svelte';
  import ArrowRight from './arrow-right.svelte';
  import ArrowUp from './arrow-up.svelte';

  export let tooltipText = '';
  export let arrow: 'up' | 'down' | 'left' | 'right' | undefined = undefined;
  export let title: string;

  const ArrowComponents = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
  };
</script>

<Tooltip text={tooltipText} hide={!tooltipText} top>
  <kbd class="shortcut">
    {#if arrow}
      <svelte:component this={ArrowComponents[arrow]} {title} />
    {:else}
      <slot />
    {/if}
  </kbd>
</Tooltip>

<style lang="postcss">
  .shortcut {
    @apply inline-flex w-auto min-w-[32px] items-center justify-center border border-slate-100 px-1 py-1.5 text-xs font-semibold text-white dark:border-slate-500 dark:bg-slate-600 dark:text-slate-100;
  }
</style>
