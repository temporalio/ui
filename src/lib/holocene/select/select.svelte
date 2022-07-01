<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import Menu, { triggerMenu } from '$lib/holocene/primatives/menu.svelte';
  import Option, { isOption } from '$lib/holocene/select/option.svelte';
  import type { Option as OptionType } from '$lib/holocene/select/option.svelte';

  type T = $$Generic;
  let show = false;

  const hide = () => (show = false);
  const toggle = () => (show = !show);

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

  const dispatch = createEventDispatcher<{ select: { value: T } }>();

  function handleOptionClick(event: CustomEvent<{ value: T }>) {
    dispatch('select', { value: event.detail.value });
  }
</script>

<div data-cy={$$props.dataCy} class="relative inline w-full {$$props.class}">
  <label class="mb-2" for={id}>{label}</label>
  <div
    class="container"
    use:triggerMenu
    on:close-menu={hide}
    on:trigger-menu={toggle}
    class:dark
  >
    <input
      class="input"
      placeholder={label}
      value={_selected}
      name={id}
      disabled
      {id}
    />
    <Icon stroke="currentcolor" name={show ? 'caretUp' : 'caretDown'} />
  </div>
  <Menu class="max-h-60" bind:show {dark}>
    {#if options}
      {#each options as option}
        {@const value = isOption(option) ? option.value : _value}
        <Option
          on:select={handleOptionClick}
          selected={value === _value}
          value={option}
          {dark}
        />
      {/each}
    {:else}
      <slot />
    {/if}
  </Menu>
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
</style>
