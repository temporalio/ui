<script lang="ts">
  export let text: string = '';
</script>

<div class="wrapper relative inline-block">
  <slot />
  <div class="tooltip">
    <div class="bg-gray-800 inline-block px-2 py-2 rounded-lg">
      <span class="text-gray-100">{text}</span>
    </div>
  </div>
</div>

<style lang="postcss">
  .tooltip {
    @apply inline-block left-0 top-0 opacity-0 whitespace-nowrap absolute z-10 translate-x-12 text-xs shadow-md transition-all invisible;
  }

  .wrapper:hover .tooltip {
    @apply opacity-90 visible;
  }
</style>
