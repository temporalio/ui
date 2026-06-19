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
  let panX = 0;
  let panY = 0;

  let svg;

  $: viewBox = {
    x: panX,
    y: panY,
    width: (width * zoomLevel) / initialZoom,
    height: (height * zoomLevel) / initialZoom,
  };

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let panOffsetX = 0;
  let panOffsetY = 0;

  const PAN_STEP_RATIO = 0.1;
  const ZOOM_STEP = 0.1;

  function panBy(dx: number, dy: number) {
    if (!pannable) return;
    panX += dx * viewBox.width;
    panY += dy * viewBox.height;
  }

  function zoomBy(factor: number, centerX = width / 2, centerY = height / 2) {
    if (!zoomable) return;
    const newZoomLevel = zoomLevel + factor;
    if (newZoomLevel < maxZoomIn || newZoomLevel > maxZoomOut) return;
    panX += (centerX * (zoomLevel - newZoomLevel)) / initialZoom;
    panY += (centerY * (zoomLevel - newZoomLevel)) / initialZoom;
    zoomLevel = newZoomLevel;
  }

  const handleWheel = (event: WheelEvent) => {
    if (!zoomable) return;
    event.preventDefault();

    const rect = svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const newZoomLevel = zoomLevel + event.deltaY * 0.001;

    if (newZoomLevel < maxZoomIn || newZoomLevel > maxZoomOut) return;

    panX += (mouseX * (zoomLevel - newZoomLevel)) / initialZoom;
    panY += (mouseY * (zoomLevel - newZoomLevel)) / initialZoom;
    zoomLevel = newZoomLevel;
  };

  function handleMouseDown(event: MouseEvent) {
    if (!pannable) return;
    isPanning = true;
    startX = event.clientX;
    startY = event.clientY;
    panOffsetX = panX;
    panOffsetY = panY;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isPanning) return;

    const dx = (startX - event.clientX) * (viewBox.width / svg.clientWidth);
    const dy = (startY - event.clientY) * (viewBox.height / svg.clientHeight);

    panX = panOffsetX + dx;
    panY = panOffsetY + dy;
  }

  function handleMouseUp() {
    isPanning = false;
  }

  function handleMouseLeave() {
    isPanning = false;
  }

  function onCenter() {
    panX = 0;
    panY = 0;
    zoomLevel = initialZoom;
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
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<div
  class="relative overflow-hidden"
  tabindex="0"
  role="group"
  aria-label="Zoomable workflow graph. Use arrow keys to pan, plus and minus to zoom."
  on:keydown={handleKeydown}
  bind:clientWidth={width}
  bind:clientHeight={height}
  style="height: min({containerHeight}px, calc(100dvh - 8rem));"
>
  <div class="absolute right-4 top-4 z-20 flex items-center gap-2">
    <slot name="controls" />
    {#if pannable}
      <Tooltip text="Pan up" bottom>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon="chevron-up"
          aria-label="Pan up"
          on:click={() => panBy(0, -PAN_STEP_RATIO)}
        />
      </Tooltip>
      <Tooltip text="Pan down" bottom>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon="chevron-down"
          aria-label="Pan down"
          on:click={() => panBy(0, PAN_STEP_RATIO)}
        />
      </Tooltip>
      <Tooltip text="Pan left" bottom>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon="chevron-left"
          aria-label="Pan left"
          on:click={() => panBy(-PAN_STEP_RATIO, 0)}
        />
      </Tooltip>
      <Tooltip text="Pan right" bottom>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon="chevron-right"
          aria-label="Pan right"
          on:click={() => panBy(PAN_STEP_RATIO, 0)}
        />
      </Tooltip>
    {/if}
    {#if zoomable}
      <Tooltip text="Zoom in" bottom>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon="plus"
          aria-label="Zoom in"
          disabled={zoomLevel - ZOOM_STEP < maxZoomIn}
          on:click={() => zoomBy(-ZOOM_STEP)}
        />
      </Tooltip>
      <Tooltip text="Zoom out" bottom>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon="minus"
          aria-label="Zoom out"
          disabled={zoomLevel + ZOOM_STEP > maxZoomOut}
          on:click={() => zoomBy(ZOOM_STEP)}
        />
      </Tooltip>
    {/if}
    <Tooltip text="Center" bottom>
      <Button
        class="cursor-pointer"
        variant="secondary"
        size="sm"
        leadingIcon="target"
        aria-label="Center"
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
