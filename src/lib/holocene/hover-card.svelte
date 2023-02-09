<script lang="ts">
  export let title: string;
  export let active = false;
</script>

<div class="card" class:active>
  <div class="flex justify-between">
    <h3>{title}</h3>
  </div>
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply ease-out duration-300 transition-all flex flex-col gap-4 w-full h-auto border-[3px] border-gray-900 rounded-xl p-8 bg-white;
  }
  .card:hover,
  .active {
    @apply ease-in duration-300 -translate-y-1 bg-gradient-to-br from-blue-100 to-purple-100;
    box-shadow: 5px 5px #18181b, 5px 5px 0px 3px #18181b;
  }

  .card h3 {
    @apply text-lg font-medium;
  }
</style>
