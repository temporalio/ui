<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import Option, { EMPTY_OPTION } from '$lib/holocene/select/option.svelte';
  import type { Option as OptionType } from '$lib/holocene/select/option.svelte';

  let container: HTMLDivElement;
  let dropdownWidth: number;
  let open = false;

  type T = $$Generic;

  export let label: string;
  export let id: string;
  export let value: OptionType<T> = EMPTY_OPTION;
  export let options: Array<typeof value> | undefined = undefined;
  export let dark: boolean = false;

  $: selectedOption = options?.find((option) => option.value === value.value);

  const dispatch = createEventDispatcher();

  function handleContainerClick() {
    open = !open;
  }

  function handleOptionClick(event: CustomEvent<{ option: OptionType<T> }>) {
    const { option } = event.detail;
    if (option.value !== value.value) {
      dispatch('change', { option });
    }
    open = false;
  }

  function handleOutsideClick(event) {
    const eventTarget =
      event.path && event.path.length > 0 ? event.path[0] : event.target;
    if (
      container.contains(eventTarget) ||
      container.contains(event.relatedTarget)
    ) {
      return;
    }

    open = false;
  }

  function handleWindowResize() {
    dropdownWidth = container?.offsetWidth;
  }

  $: {
    dropdownWidth = container?.offsetWidth;
  }
</script>

<svelte:window on:click={handleOutsideClick} on:resize={handleWindowResize} />

<div class={$$props.class}>
  <label class="mb-2" for={id}>{label}</label>
  <div
    class="container"
    class:open
    class:dark
    on:click={handleContainerClick}
    bind:this={container}
  >
    <input
      class="input"
      placeholder={label}
      value={selectedOption ? selectedOption.label : value.label}
      name={id}
      disabled
      {id}
    />
    <Icon stroke="currentcolor" name={open ? 'caretUp' : 'caretDown'} />
  </div>
  {#if open}
    <div class="options" class:dark style="width: {dropdownWidth}px">
      {#if options}
        {#each options as { label, value: optionValue, description }}
          <Option
            on:click={handleOptionClick}
            value={optionValue}
            selected={optionValue === value.value}
            {dark}
            {label}
            {description}
          />
        {/each}
      {:else}
        <slot />
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  .container {
    @apply flex flex-row justify-between items-center h-10 w-full rounded-sm border border-gray-900 text-base bg-white px-2;
  }

  .container.open {
    @apply border-2 border-blue-700;
  }

  .container.dark,
  .container.dark input {
    @apply bg-gray-900 text-white;
  }

  .container.dark input {
    @apply placeholder:text-gray-200;
  }

  .input {
    @apply w-full h-full bg-white cursor-pointer;
  }

  .options {
    @apply rounded-sm bg-white fixed border border-gray-900 mt-1 max-h-60 overflow-y-scroll;
    box-shadow: 0 2px 2px 0 rgb(0, 0, 0, 0.15);
  }

  .options.dark {
    @apply bg-gray-900 text-white;
  }
</style>
