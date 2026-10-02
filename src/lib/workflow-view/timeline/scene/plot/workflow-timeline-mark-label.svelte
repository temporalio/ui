<script lang="ts">
  import { getLabelX } from './label-placement';
  import type { MarkBounds } from './mark-geometry';

  let {
    label,
    mark,
    nodes,
    scrollLeft,
    viewportWidth,
  }: {
    label: string;
    mark: MarkBounds;
    nodes: readonly MarkBounds[];
    scrollLeft: number;
    viewportWidth: number;
  } = $props();

  let labelWidth = $state(0);
  const labelX = $derived(
    getLabelX(mark, nodes, labelWidth, scrollLeft, viewportWidth),
  );
</script>

<div class="label-track">
  <span
    class="label"
    style:margin-left={`${labelX}px`}
    style:max-width={`${Math.max(1, viewportWidth - 16)}px`}
    bind:clientWidth={labelWidth}
    title={label}>{label}</span
  >
</div>

<style>
  .label-track {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    width: 100%;
    pointer-events: none;
  }

  .label {
    position: sticky;
    left: 8px;
    right: 8px;
    z-index: 3;
    flex: none;
    padding: 1px 5px;
    border-radius: 3px;
    background: color-mix(
      in srgb,
      var(--color-surface-primary) 80%,
      transparent
    );
    font-size: 12px;
    line-height: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
