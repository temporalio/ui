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

  const ArrowComponent = $derived(arrow ? ArrowComponents[arrow] : null);
</script>

<Tooltip text={tooltipText} hide={!tooltipText} top>
  <kbd class="shortcut">
    {#if ArrowComponent}
      <ArrowComponent {title} />
    {:else}
      {@render children?.()}
    {/if}
  </kbd>
</Tooltip>

<style lang="postcss">
  .shortcut {
    @apply surface-secondary inline-flex h-6 w-auto min-w-6 items-center justify-center rounded-control border border-subtle px-1.5 font-mono text-[0.6875rem] font-medium text-secondary shadow-raised;
  }
</style>
