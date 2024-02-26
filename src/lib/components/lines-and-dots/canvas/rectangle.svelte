<script lang="ts">
  import Layer from './layer.svelte';

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;
  export let color: string | undefined = undefined;

  $: render = ({ context }) => {
    context.beginPath();
    context.fillRect(x, y, width, height);
    context.fillStyle = '#444F64';
    context.stroke();
  };
</script>

<Layer
  {render}
  on:mouseenter
  on:mouseleave
  on:mousedown
  on:mousedown
  on:mousemove
  on:mouseup
  on:touchstart
  on:touchstart
  on:touchmove
  on:touchend
/>
