<script lang="ts">
  const grabberWidth = 10;

  export let x = 150;
  export let height = 1000;
  export let onExpand: (x: number) => void;

  let expanding = null;
  let start = null;
  let initial = null;

  function startExpand(event) {
    expanding = true;
    start = event.pageX;
    initial = { x };
  }

  function stopExpand() {
    expanding = null;
    start = null;
    initial = null;
  }

  function expand(event) {
    if (!expanding) return;

    const delta = start - event.pageX;
    const newX = initial.x - delta;
    onExpand(newX);
    return;

    // Might need directional check
    // if (expanding == 'left') {
    // 	const delta = start-event.pageX
    // 	x = initial.x - delta
    // 	width = initial.width + delta
    // 	return
    // }

    // if (expanding == 'right') {
    // 	const delta = event.pageX-start
    // 	width = initial.width + delta
    // 	return
    // }
  }
</script>

<svelte:window on:mouseup={stopExpand} on:mousemove={expand} />

<rect
  x={x - grabberWidth}
  y={0}
  width={grabberWidth}
  {height}
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
