<script lang="ts">
  import Option from './option.svelte';

  export let id: string;
  export let value: SelectOptionValue;
  export let label: string = null;
  export let dark: boolean = false;
  export let arrow: boolean = false;
  export let name = id;

  export let options: SelectOptionValue[] = [];
</script>

<div>
  <label class="hidden" for={id}>{label}</label>
  <select
    class="inline border-2 text-base px-2 h-10 rounded-lg w-full {$$props.class}"
    class:dark
    class:remove={arrow}
    {name}
    {id}
    bind:value
    on:change
  >
    <slot>
      {#each options as option}
        <Option value={option} />
      {/each}
    </slot>
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
