<script lang="ts">
  export let id: OptionalProperty<string> = undefined;
  export let value: string | boolean;
  export let dark: boolean = false;
  export let arrow: boolean = false;
</script>

<div
  class:arrow
  class="relative flex flex-col items-start justify-center border-gray-100 w-full"
>
  <select
    class="inline border-2 text-base px-2 w-full h-10 rounded-lg"
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
    @apply appearance-none h-8 text-sm py-1 pl-3 rounded-xl;
  }

  .dark {
    @apply bg-gray-900 text-white;
  }

  .arrow::after {
    @apply text-white text-sm font-normal mr-4;
    font-family: 'Font Awesome 5 Free';
    content: '\f0dc';
  }
</style>
