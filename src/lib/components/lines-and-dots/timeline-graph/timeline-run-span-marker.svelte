<script lang="ts">
  type Props = {
    /** The run's own row, so the marker can move with it. */
    rowKey: string;
    startPx: number;
    endPx: number;
    centerYPx: number;
    color: string;
    /** Caps mark a known, visible boundary; an open end reads as ongoing. */
    drawStartCap: boolean;
    drawEndCap: boolean;
  };

  const {
    rowKey,
    startPx,
    endPx,
    centerYPx,
    color,
    drawStartCap,
    drawEndCap,
  }: Props = $props();

  const CAP_PX = 12;
</script>

<div
  class="pointer-events-none absolute"
  data-testid="timeline-run-span"
  data-timeline-run-span-key={rowKey}
  style:left="{startPx}px"
  style:width="{Math.max(2, endPx - startPx)}px"
  style:top="{centerYPx - CAP_PX / 2}px"
  style:height="{CAP_PX}px"
  style:color
>
  <span class="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current"
  ></span>
  {#if drawStartCap}
    <span class="absolute inset-y-0 left-0 w-0.5 bg-current"></span>
  {/if}
  {#if drawEndCap}
    <span class="absolute inset-y-0 right-0 w-0.5 bg-current"></span>
  {/if}
</div>
