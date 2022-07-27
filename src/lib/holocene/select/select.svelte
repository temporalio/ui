<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$holocene/icon/index.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import Option, { isOption } from '$holocene/select/option.svelte';
  import type { Option as OptionType } from '$holocene/select/option.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';

  type T = $$Generic;
  let show = false;

  export let label = '';
  export let id: string;
  export let value: T;
  export let options: T[] | undefined = undefined;
  export let dark: boolean = false;
  export let placeholder = '';

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

<div class="select {$$props.class}">
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <MenuContainer class="w-full">
    <MenuButton
      class="select-input-container"
      bind:show
      controls="{id}-menu"
      data-cy={$$props.dataCy}
      {dark}
    >
      <input
        class="select-input"
        class:dark
        {placeholder}
        value={_selected}
        name={id}
        disabled
        {id}
      />
      <Icon stroke="currentcolor" name={show ? 'caretUp' : 'caretDown'} />
    </MenuButton>
    <Menu id="{id}-menu" class="max-h-96 border-primary" {show} {dark}>
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
  </MenuContainer>
</div>

<style lang="postcss">
  label {
    @apply mb-10 text-sm font-medium text-gray-900;
  }

  .select :global(.select-input-container) {
    @apply flex h-10 w-full flex-row items-center justify-between rounded border border-gray-900 bg-white px-2 text-sm text-primary;
  }

  .select :global(.select-input-container.show) {
    @apply border-blue-700;
  }

  .select-input {
    @apply h-full w-full cursor-pointer bg-white placeholder:text-gray-900;
  }

  .select-input.dark {
    @apply bg-primary text-white placeholder:text-gray-200;
  }
</style>
