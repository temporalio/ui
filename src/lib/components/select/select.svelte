<script lang="ts">
  export let id: string = null;
  export let value: string | boolean;
  export let color: string = '';
</script>

<div class="flex flex-col items-start justify-center border-gray-100">
  <select
    class={`inline border-2 text-base p-2 w-full h-10 rounded-lg ${color}`}
    {id}
    bind:value
    on:change
  >
    <slot />
  </select>
</div>

<style lang="postcss">
  select {
    @apply text-gray-500;
  }
  .black {
    @apply bg-black text-white;
  }
</style>
