<script lang="ts">
  import Option from './simple-option.svelte';
  import type { SelectOptionValue } from '$lib/types/global';

  export let id: string;
  export let value: SelectOptionValue;
  export let label: string = null;
  export let dark: boolean = false;
  export let arrow: boolean = false;
  export let name = id;

  export let options: SelectOptionValue[] = [];
</script>

<div>
  <label class="sr-only" for={id}>{label}</label>
  <select
    class="inline h-10 w-full rounded-lg border-2 px-2 text-base {$$props.class}"
    class:dark
    class:remove={arrow}
    {name}
    {id}
    bind:value
    on:change
    data-testid={$$props.testId}
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
    @apply h-8 appearance-none rounded-xl py-1 pl-3 text-sm;
  }

  .dark {
    @apply bg-gray-900 text-white;
  }
</style>
