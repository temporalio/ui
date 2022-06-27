<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import Option, { isOption } from '$lib/holocene/select/option.svelte';
  import type { Option as OptionType } from '$lib/holocene/select/option.svelte';

  let container: HTMLDivElement;
  let dropdownWidth: number;
  let open = false;

  type T = $$Generic;

  export let label: string = '';
  export let id: string;
  export let value: T;
  export let options: T[] | undefined = undefined;
  export let dark: boolean = false;

  let _value: OptionType['value'] | T;
  let _selected: string | T;
  $: {
    if (value) {
      if (isOption(value)) {
        _value = value.value;
        _selected = value.label;
      } else {
        _value = value;
        _selected = value;
      }
    } else {
      _selected = '';
    }
  }

  const dispatch = createEventDispatcher<{ change: { value: T } }>();

  function handleContainerClick() {
    open = !open;
  }

  function handleOptionClick(event: CustomEvent<{ value: T }>) {
    dispatch('change', { value: event.detail.value });
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

<div data-cy={$$props.dataCy} class={$$props.class}>
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
      value={_selected}
      name={id}
      disabled
      {id}
    />
    <Icon stroke="currentcolor" name={open ? 'caretUp' : 'caretDown'} />
  </div>
  {#if open}
    <div class="options" class:dark style="width: {dropdownWidth}px">
      {#if options}
        {#each options as option}
          {@const value = isOption(option) ? option.value : _value}
          <Option
            on:select={handleOptionClick}
            selected={value === _value}
            {dark}
            value={option}
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
    @apply flex h-10 w-full flex-row items-center justify-between rounded-sm border border-gray-900 bg-white px-2 text-base;
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
    @apply h-full w-full cursor-pointer bg-white;
  }

  .options {
    @apply fixed mt-1 max-h-60 overflow-y-scroll rounded-sm border border-gray-900 bg-white;
    box-shadow: 0 2px 2px 0 rgb(0, 0, 0, 0.15);
  }

  .options.dark {
    @apply bg-gray-900 text-white;
  }
</style>
