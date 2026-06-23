<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';

  import type { GraphConfig } from '../constants';

  import Line from './line.svelte';
  import TimelineIcon, { type TimelineIconName } from './timeline-icon.svelte';

  type Props = {
    point?: [number, number];
    category?: string;
    status?: WorkflowStatus | 'none';
    fontSize?: string;
    fontWeight?: string | number;
    textAnchor?: string;
    backdrop?: boolean;
    backdropHeight?: number;
    icon?: TimelineIconName;
    config?: GraphConfig;
    label?: boolean;
    children?: Snippet;
  };

  let {
    point = [0, 0],
    category = undefined,
    status = 'none',
    fontSize = '13px',
    fontWeight = '400',
    textAnchor = 'start',
    backdrop = false,
    backdropHeight = 0,
    icon = undefined,
    config = undefined,
    label = false,
    children,
  }: Props = $props();

  // PERF: getBBox() forces the browser to flush SVG layout and compute exact glyph
  // metrics for every call — the SVG equivalent of element.clientWidth. With 10k
  // rows each calling getBBox() after mount, this was 10k forced SVG reflows.
  //
  // Fix: OffscreenCanvas.measureText() queries the same underlying font metrics
  // engine but without touching the DOM layout tree. One canvas context is shared
  // across all Text instances (module-level singleton). Results are cached by
  // (text, font) because the same event-type label strings repeat thousands of
  // times in a 40k event timeline — each unique string is measured exactly once.
  const _textWidthCache = new Map<string, number>();
  let _ctx: OffscreenCanvasRenderingContext2D | null = null;

  function measureText(text: string, weight: string, size: string): number {
    if (!text) return 0;
    const font = `${weight} ${size} ui-sans-serif,system-ui,sans-serif`;
    const cacheKey = `${font}|${text}`;
    const cached = _textWidthCache.get(cacheKey);
    if (cached !== undefined) return cached;
    if (!_ctx) {
      _ctx = new OffscreenCanvas(0, 0).getContext('2d');
    }
    if (!_ctx) return text.length * 7.5;
    _ctx.font = font;
    const width = _ctx.measureText(text).width;
    _textWidthCache.set(cacheKey, width);
    return width;
  }

  let textElement: SVGTextElement = $state();

  const showIcon = $derived(icon && config);
  // Only measure when the width is actually used (backdrop rectangle or icon
  // x-offset). Skipping the canvas call for plain text rows avoids any work
  // for the majority of timeline rows that have neither.
  const textWidth = $derived(
    backdrop || showIcon
      ? measureText(
          textElement?.textContent ?? '',
          String(fontWeight),
          fontSize,
        )
      : 0,
  );
  const backdropWidth = $derived(showIcon ? textWidth + 36 : textWidth + 12);
  const textX = $derived(
    showIcon && textAnchor === 'start'
      ? point[0] + config.radius * 2
      : point[0],
  );
</script>

{#if backdrop}
  <Line
    startPoint={[point[0] - backdropHeight, point[1]]}
    endPoint={[point[0] + backdropWidth, point[1]]}
    {status}
    strokeWidth={backdropHeight}
  />
{/if}
{#if showIcon}
  <TimelineIcon
    name={icon}
    x={textAnchor === 'end' ? point[0] - textWidth - backdropHeight : point[0]}
    y={point[1] - 8}
    class={!backdrop ? 'text-primary' : 'text-white'}
  />
{/if}
{#key textX}
  <text
    bind:this={textElement}
    class="cursor-pointer select-none outline-none {category} text-primary"
    class:label
    class:backdrop
    x={textX}
    y={point[1] + 1}
    font-size={fontSize}
    font-weight={fontWeight}
    text-anchor={textAnchor}
  >
    {@render children?.()}
  </text>
{/key}

<style lang="postcss">
  text {
    @apply fill-current;

    opacity: 1;
    stroke: none;
    dominant-baseline: middle;
    alignment-baseline: baseline;
  }

  text.backdrop {
    @apply fill-white;
  }

  .label {
    fill: #c9d9f0;
    font-weight: 500;
  }

  text.marker,
  .command {
    fill: #ebebeb;
  }

  text.timer {
    fill: #fbbf24;
  }

  text.signal {
    fill: #ec4899;
  }

  text.activity {
    fill: #a78bfa;
  }

  text.pending {
    fill: #a78bfa;
  }

  text.child-workflow {
    fill: theme('colors.cyan.600');
  }

  text.workflow {
    fill: #059669;
  }

  text.Failed {
    fill: #ff4418;
  }

  text.none {
    fill: theme('colors.space-black');
  }
</style>
