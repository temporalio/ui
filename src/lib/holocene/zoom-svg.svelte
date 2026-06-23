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

  const PAN_STEP_RATIO = 0.1;
  const ZOOM_STEP = 0.1;

  function panBy(dx: number, dy: number) {
    if (!pannable) return;
    viewBox.x += dx * viewBox.width;
    viewBox.y += dy * viewBox.height;
  }

  function zoomBy(factor: number) {
    if (!zoomable) return;
    const newZoomLevel = zoomLevel + factor;
    if (newZoomLevel < maxZoomIn || newZoomLevel > maxZoomOut) return;
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;
    const zoomRatio = newZoomLevel / zoomLevel;
    viewBox.width *= zoomRatio;
    viewBox.height *= zoomRatio;
    viewBox.x = centerX - viewBox.width / 2;
    viewBox.y = centerY - viewBox.height / 2;
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
  </div>
  <div class="absolute bottom-4 right-4 z-20 flex items-center gap-2">
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
          leadingIcon="add"
          aria-label="Zoom in"
          disabled={zoomLevel - ZOOM_STEP < maxZoomIn}
          on:click={() => zoomBy(-ZOOM_STEP)}
        />
      </Tooltip>
      <Tooltip text="Zoom out" bottom>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon="hyphen"
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
