<script lang="ts">
  export let startTime: string;

  const ticks = 20;
</script>

<div class="flex justify-start">
  {#each Array(ticks) as _}
    <p class="text:sm h-24 w-24 text-white">
      <!-- {new Date(startTime)} -->
      <!-- 1 sec. -->
    </p>
  {/each}
</div>

<style lang="postcss">
  line {
    stroke: #141414;
    fill: #141414;
  }

  p {
    transform: rotate(90deg);
  }
</style>
