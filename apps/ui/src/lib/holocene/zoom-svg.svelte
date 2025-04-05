<script lang="ts">
  import Button from './button.svelte';
  import Tooltip from './tooltip.svelte';

  export let containerHeight = 600;
  export let initialZoom = 1;
  export let maxZoomIn = 0.25;
  export let maxZoomOut = 2.5;
  export let width = 600;
  export let height = 400;
  export let zoomable = true;
  export let pannable = true;

  let zoomLevel = initialZoom;

  let svg;

  $: viewBox = {
    x: 0,
    y: 0,
    width,
    height,
  };

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let panOffsetX = 0;
  let panOffsetY = 0;

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
    <slot name="controls" />
    <Tooltip text="Center" bottom>
      <Button
        class="cursor-pointer"
        variant="secondary"
        size="sm"
        leadingIcon="target"
        on:click={() => {
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
    class="relative select-none {$$restProps.class}"
    class:cursor-grab={pannable}
    class:active:cursor-grabbing={pannable}
    on:wheel={handleWheel}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseLeave}
  >
    <slot {width} {height} {zoomLevel} />
  </svg>
</div>
