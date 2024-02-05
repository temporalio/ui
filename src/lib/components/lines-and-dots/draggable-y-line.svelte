<script lang="ts">
  const grabberWidth = 10;

  export let y = 150;
  export let width = 1000;
  export let onExpand: (x: number) => void;

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
    const newX = initial.x - delta;
    onExpand(newX);
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
  class="grip"
  class:active={!!expanding}
/>

<style>
  .grip {
    cursor: col-resize;
    fill: #475569;
  }

  .grip.active,
  .grip:hover {
    fill: #444ce7;
  }
</style>
