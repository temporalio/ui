<script lang="ts">
  import type { IconName } from '$lib/holocene/icon/paths';
  import { clickOutside } from '$lib/holocene/outside-click';
  import Input from '$lib/holocene/input.svelte';

  export let id: string;
  export let label: string;
  export let value: string;
  export let icon: IconName = '';
  export let copyable: boolean = false;
  export let theme: 'dark' | 'light' = 'light';
  export let options: string[];
  export let onOptionClick: (option: string) => void;

  let show = false;
  $: filteredOptions = !value
    ? options
    : options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase()),
      );
</script>

<div
  class="autocomplete-container"
  use:clickOutside
  on:click-outside={() => (show = false)}
>
  <Input
    {id}
    {value}
    {icon}
    {label}
    {theme}
    {copyable}
    on:input
    on:change
    on:focus={() => (show = true)}
  />
  {#if show}
    <div class="option-container">
      {#each filteredOptions as option}
        <div
          class="option"
          on:click|preventDefault|stopPropagation={() => {
            onOptionClick(option);
            show = false;
          }}
        >
          {option}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="postcss">
  .autocomplete-container {
    @apply relative;
  }
  .option-container {
    @apply absolute z-50 h-auto max-h-80 overflow-auto rounded-lg border-2 bg-white;
  }
  .option {
    @apply cursor-pointer p-2 hover:bg-blue-600 hover:text-white;
  }
</style>
