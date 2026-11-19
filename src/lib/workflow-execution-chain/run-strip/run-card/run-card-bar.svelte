<script lang="ts">
  import type { RunBarSegment } from './run-bar';

  interface Props {
    segments: readonly RunBarSegment[];
    loadedFraction: number;
  }

  let { segments, loadedFraction }: Props = $props();
</script>

<span class="flex h-1.5 w-full overflow-hidden rounded-full">
  <span class="flex h-full gap-px" style:width="{loadedFraction * 100}%">
    {#each segments as segment, index (index)}
      <span
        class="h-full min-w-px flex-1"
        style:background-color={segment.color}
        style:opacity={segment.opacity}
      ></span>
    {/each}
  </span>
  {#if loadedFraction < 1}
    <span class="h-full flex-1 bg-surface-tertiary motion-safe:animate-pulse"
    ></span>
  {/if}
</span>
