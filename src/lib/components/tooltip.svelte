<script lang="ts">
  import Copyable from './copyable.svelte';

  export let text: string = '';
  export let top = false;
  export let right = false;
  export let bottom = false;
  export let left = false;
  export let copyable = false;
</script>

<div class="wrapper relative inline-block">
  <slot />
  <div class="tooltip" class:left class:right class:bottom class:top>
    <div class="bg-gray-800 inline-block px-2 py-2 rounded-lg">
      {#if copyable}
        <Copyable content={text} color="white">
          <span class="text-gray-100">{text}</span>
        </Copyable>
      {:else}
        <span class="text-gray-100">{text}</span>
      {/if}
    </div>
  </div>
</div>

<style lang="postcss">
  .tooltip {
    @apply inline-block left-0 top-0 opacity-0 whitespace-nowrap absolute z-50 translate-x-12 text-xs shadow-md transition-all invisible;
  }

  .tooltip.top {
    @apply left-1/2 -mt-4 -translate-x-1/2 -translate-y-full;
  }
  .tooltip.bottom {
    @apply left-1/2 bottom-0 -mb-2 -translate-x-1/2 translate-y-full;
  }
  .tooltip.left {
    @apply left-0 -ml-4 -translate-x-full;
  }
  .tooltip.right {
    @apply right-0 -mr-4 translate-x-full;
  }

  .wrapper {
    /* @apply absolute; */
  }
  .wrapper:hover .tooltip {
    @apply opacity-90 visible;
  }
</style>
