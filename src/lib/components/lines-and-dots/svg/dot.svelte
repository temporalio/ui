<script lang="ts">
  export let center: number;
  export let y: number = 20;
  export let r = 6;

  const x = center;
</script>

<circle class="dot completed" cx={x} cy={y} {r} />

<style lang="postcss">
  .dot {
    stroke-width: 2;
  }

  .completed {
    fill: #059669;
    stroke: #059669;
  }
</style>
