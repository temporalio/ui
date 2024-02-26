<script lang="ts">
  const grabberWidth = 12;

  export let y = 150;
  export let width = 1000;
  export let onExpand: (x: number) => void;
  export let onDoubleClick: () => void;

  let expanding = null;
  let start = null;
  let initial = null;

  function startExpand(event) {
    expanding = true;
    start = event.pageY;
    initial = { y };
  }

  function stopExpand() {
    expanding = null;
    start = null;
    initial = null;
  }

  function expand(event) {
    if (!expanding) return;

    const delta = start - event.pageY;
    const newY = initial.y - delta;
    onExpand(newY);
    return;
  }
</script>

<svelte:window on:mouseup={stopExpand} on:mousemove={expand} />

<rect
  x={0}
  y={y - grabberWidth}
  {width}
  height={grabberWidth}
  on:mousedown={startExpand}
  on:dblclick={onDoubleClick}
  class="grip"
  class:active={!!expanding}
/>

<style>
  .grip {
    cursor: row-resize;
    fill: #475569;
  }

  .grip.active,
  .grip:hover {
    fill: #444ce7;
  }
</style>
