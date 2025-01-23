<script lang="ts">
  import type { Snippet } from 'svelte';

  import Button from './button.svelte';
  import Tooltip from './tooltip.svelte';

  interface Props {
    containerHeight?: number;
    initialZoom?: number;
    maxZoomIn?: number;
    maxZoomOut?: number;
    width?: number;
    height?: number;
    zoomable?: boolean;
    pannable?: boolean;
    class?: string;
    controls?: Snippet;
    children?: Snippet<[{ width: number; height: number; zoomLevel: number }]>;
  }

  let {
    containerHeight = 600,
    initialZoom = 1,
    maxZoomIn = 0.25,
    maxZoomOut = 2.5,
    width = 600,
    height = 400,
    zoomable = true,
    pannable = true,
    class: className = '',
    controls,
    children,
  }: Props = $props();

  let zoomLevel = $state(initialZoom);

  let svg: SVGElement = $state();

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

  const handleWheel = (event: WheelEvent) => {
    if (!zoomable) return;
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

    viewBox.x = mouseX - (mouseX - viewBox.x) * zoomRatio;
    viewBox.y = mouseY - (mouseY - viewBox.y) * zoomRatio;
    viewBox.width = newWidth;
    viewBox.height = newHeight;

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
    if (!isPanning) return;

    const dx = (startX - event.clientX) * (viewBox.width / svg.clientWidth);
    const dy = (startY - event.clientY) * (viewBox.height / svg.clientHeight);

    viewBox.x = panOffsetX + dx;
    viewBox.y = panOffsetY + dy;
  }

  function handleMouseUp() {
    isPanning = false;
  }

  function handleMouseLeave() {
    isPanning = false;
  }

  function onCenter() {
    viewBox.x = 0;
    viewBox.y = 0;
    viewBox.width = width;
    viewBox.height = height;
    zoomLevel = initialZoom;
  }
</script>

<div
  class="relative overflow-hidden"
  bind:clientWidth={width}
  bind:clientHeight={height}
  style="height: {containerHeight}px"
>
  <div class="absolute right-4 top-4 z-20 flex items-center gap-2">
    {@render controls?.()}
    <Tooltip text="Center" bottom>
      <Button
        class="cursor-pointer"
        variant="secondary"
        size="sm"
        leadingIcon="target"
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
    class="relative select-none {className}"
    class:cursor-grab={pannable}
    class:active:cursor-grabbing={pannable}
    onwheel={handleWheel}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseLeave}
  >
    {@render children?.({ width, height, zoomLevel })}
  </svg>
</div>
