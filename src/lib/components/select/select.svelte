<script lang="ts">
  export let id: string = null;
  export let value: string | boolean;
  export let dark: boolean = false;
  export let arrow: boolean = false;
</script>

<div
  class:arrow
  class="relative flex flex-col items-start justify-center border-gray-100 w-full"
>
  <select
    class="inline border-2 text-base p-2 w-full h-10 rounded-lg"
    class:dark
    class:remove={arrow}
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

  .remove {
    @apply appearance-none;
  }

  .dark {
    @apply bg-gray-900 text-white;
  }

  .arrow::after {
    @apply absolute text-white text-sm font-normal top-3 right-3;
    font-family: 'Font Awesome 5 Free';
    content: '\f0dc';
  }
</style>
