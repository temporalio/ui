<script lang="ts">
  import type { Snippet } from 'svelte';

  import {
    IconAdd,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
    IconHyphen,
    IconTarget,
  } from '$lib/io/icon';

  import Button from './button.svelte';
  import Tooltip from './tooltip.svelte';

  interface Props {
    containerHeight?: number;
    initialZoom?: number;
    maxZoomIn?: number;
    maxZoomOut?: number;
    zoomable?: boolean;
    pannable?: boolean;
    class?: string;
    controls?: Snippet;
    graph?: Snippet<[{ width: number; height: number; zoomLevel: number }]>;
  }

  let {
    containerHeight = 600,
    initialZoom = 1,
    maxZoomIn = 0.25,
    maxZoomOut = 2.5,
    zoomable = true,
    pannable = true,
    class: className = '',
    controls,
    graph,
  }: Props = $props();

  let width = $state(600);
  let height = $state(400);

  // svelte-ignore state_referenced_locally
  let zoomLevel = $state(initialZoom);

  let svg = $state<SVGSVGElement>();

  let viewBox = $derived({
    x: 0,
    y: 0,
    width,
    height,
  });

  let isPanning = $state(false);
  let startX = $state(0);
  let startY = $state(0);
  let panOffsetX = $state(0);
  let panOffsetY = $state(0);

  const PAN_STEP_RATIO = 0.1;
  const ZOOM_STEP = 0.1;

  function panBy(dx: number, dy: number) {
    if (!pannable) return;
    viewBox = {
      ...viewBox,
      x: viewBox.x + dx * viewBox.width,
      y: viewBox.y + dy * viewBox.height,
    };
  }

  function zoomBy(factor: number) {
    if (!zoomable) return;
    const newZoomLevel = zoomLevel + factor;
    if (newZoomLevel < maxZoomIn || newZoomLevel > maxZoomOut) return;
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;
    const zoomRatio = newZoomLevel / zoomLevel;
    const newWidth = viewBox.width * zoomRatio;
    const newHeight = viewBox.height * zoomRatio;
    viewBox = {
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight,
    };
    zoomLevel = newZoomLevel;
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        panBy(0, -PAN_STEP_RATIO);
        break;
      case 'ArrowDown':
        event.preventDefault();
        panBy(0, PAN_STEP_RATIO);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        panBy(-PAN_STEP_RATIO, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        panBy(PAN_STEP_RATIO, 0);
        break;
      case '+':
      case '=':
        event.preventDefault();
        zoomBy(-ZOOM_STEP);
        break;
      case '-':
      case '_':
        event.preventDefault();
        zoomBy(ZOOM_STEP);
        break;
    }
  }

  const handleWheel = (event: WheelEvent) => {
    if (!zoomable || !svg) return;
    event.preventDefault();

    const rect = svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomAmount = event.deltaY * 0.001;
    let newZoomLevel = zoomLevel + zoomAmount;

    if (newZoomLevel < maxZoomIn || newZoomLevel > maxZoomOut) return;

    const zoomRatio = newZoomLevel / zoomLevel;
    const newWidth = viewBox.width * zoomRatio;
    const newHeight = viewBox.height * zoomRatio;

    viewBox = {
      x: mouseX - (mouseX - viewBox.x) * zoomRatio,
      y: mouseY - (mouseY - viewBox.y) * zoomRatio,
      width: newWidth,
      height: newHeight,
    };

    zoomLevel = newZoomLevel;
  };

  function handleMouseDown(event: MouseEvent) {
    if (!pannable) return;
    isPanning = true;
    startX = event.clientX;
    startY = event.clientY;
    panOffsetX = viewBox.x;
    panOffsetY = viewBox.y;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isPanning || !svg) return;

    const dx = (startX - event.clientX) * (viewBox.width / svg.clientWidth);
    const dy = (startY - event.clientY) * (viewBox.height / svg.clientHeight);

    viewBox = { ...viewBox, x: panOffsetX + dx, y: panOffsetY + dy };
  }

  function handleMouseUp() {
    isPanning = false;
  }

  function handleMouseLeave() {
    isPanning = false;
  }

  function onCenter() {
    viewBox = { x: 0, y: 0, width, height };
    zoomLevel = initialZoom;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="relative overflow-hidden"
  tabindex="0"
  role="group"
  aria-label="Zoomable workflow graph. Use arrow keys to pan, plus and minus to zoom."
  onkeydown={handleKeydown}
  bind:clientWidth={width}
  bind:clientHeight={height}
  style="height: min({containerHeight}px, calc(100dvh - 8rem));"
>
  <div class="absolute right-4 top-4 z-20 flex items-center gap-2">
    {@render controls?.()}
  </div>
  <div class="absolute bottom-4 right-4 z-20 flex items-center gap-2">
    {#if pannable}
      <Tooltip text="Pan up" bottom>
        <Button
          variant="secondary"
          size="sm"
          LeadingIcon={IconChevronUp}
          aria-label="Pan up"
          onclick={() => panBy(0, -PAN_STEP_RATIO)}
        />
      </Tooltip>
      <Tooltip text="Pan down" bottom>
        <Button
          variant="secondary"
          size="sm"
          LeadingIcon={IconChevronDown}
          aria-label="Pan down"
          onclick={() => panBy(0, PAN_STEP_RATIO)}
        />
      </Tooltip>
      <Tooltip text="Pan left" bottom>
        <Button
          variant="secondary"
          size="sm"
          LeadingIcon={IconChevronLeft}
          aria-label="Pan left"
          onclick={() => panBy(-PAN_STEP_RATIO, 0)}
        />
      </Tooltip>
      <Tooltip text="Pan right" bottom>
        <Button
          variant="secondary"
          size="sm"
          LeadingIcon={IconChevronRight}
          aria-label="Pan right"
          onclick={() => panBy(PAN_STEP_RATIO, 0)}
        />
      </Tooltip>
    {/if}
    {#if zoomable}
      <Tooltip text="Zoom in" bottom>
        <Button
          variant="secondary"
          size="sm"
          LeadingIcon={IconAdd}
          aria-label="Zoom in"
          disabled={zoomLevel - ZOOM_STEP < maxZoomIn}
          onclick={() => zoomBy(-ZOOM_STEP)}
        />
      </Tooltip>
      <Tooltip text="Zoom out" bottom>
        <Button
          variant="secondary"
          size="sm"
          LeadingIcon={IconHyphen}
          aria-label="Zoom out"
          disabled={zoomLevel + ZOOM_STEP > maxZoomOut}
          onclick={() => zoomBy(ZOOM_STEP)}
        />
      </Tooltip>
    {/if}
    <Tooltip text="Center" bottom>
      <Button
        class="cursor-pointer"
        variant="secondary"
        size="sm"
        LeadingIcon={IconTarget}
        aria-label="Center"
        onclick={() => {
          onCenter();
        }}
      />
    </Tooltip>
  </div>
  <svg
    role="presentation"
    bind:this={svg}
    viewBox="{viewBox.x} {viewBox.y} {viewBox.width} {viewBox.height}"
    {width}
    {height}
    class={[
      'relative select-none',
      pannable && 'cursor-grab active:cursor-grabbing',
      className,
    ]}
    onwheel={handleWheel}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseLeave}
  >
    {@render graph?.({ width, height, zoomLevel })}
  </svg>
</div>
