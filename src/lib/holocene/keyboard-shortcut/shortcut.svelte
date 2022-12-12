<script lang="ts">
  import Tooltip from '$holocene/tooltip.svelte';
  import ArrowUp from './arrow-up.svelte';
  import ArrowDown from './arrow-down.svelte';
  import ArrowRight from './arrow-right.svelte';
  import ArrowLeft from './arrow-left.svelte';

  export let tooltipText: string = '';
  export let arrow: 'up' | 'down' | 'left' | 'right' | undefined = undefined;

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
      <svelte:component this={ArrowComponents[arrow]} />
    {:else}
      <slot />
    {/if}
  </kbd>
</Tooltip>

<style lang="postcss">
  .shortcut {
    @apply inline-flex items-center px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500;
  }
</style>
