<script lang="ts">
  export let x = 0;
  export let y = 0;

  let canvasWidth: number = 1000;
  let canvasHeight: number = 1000;
</script>

<div class="h-full w-full" bind:clientWidth={canvasWidth}>
  <svg
    {x}
    {y}
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight}
    width={canvasWidth}
  >
  </svg>
</div>
