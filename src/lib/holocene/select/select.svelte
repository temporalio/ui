<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import Menu from '$lib/holocene/primatives/menu/menu.svelte';
  import Option, { isOption } from '$lib/holocene/select/option.svelte';
  import type { Option as OptionType } from '$lib/holocene/select/option.svelte';
  import MenuButton from '../primatives/menu/menu-button.svelte';
  import MenuContainer from '../primatives/menu/menu-container.svelte';

  type T = $$Generic;
  let show = false;

  export let label = '';
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

{#if label}
  <label class="mb-2" for={id}>{label}</label>
{/if}
<MenuContainer class="w-full {$$props.class}">
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
      placeholder={label}
      value={_selected}
      name={id}
      disabled
      {id}
    />
    <Icon stroke="currentcolor" name={show ? 'caretUp' : 'caretDown'} />
  </MenuButton>
  <Menu id="{id}-menu" class="max-h-60 border-primary" {show} {dark}>
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

<style lang="postcss">
  :global(.select-input-container) {
    @apply flex h-10 w-full flex-row items-center justify-between rounded border border-gray-900 bg-white px-2 text-sm;
  }

  .select-input {
    @apply h-full w-full cursor-pointer bg-white;
  }

  .select-input.dark {
    @apply bg-primary text-white placeholder:text-gray-200;
  }
</style>
