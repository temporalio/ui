<script lang="ts" context="module">
  export interface SelectContext<T> extends SelectOption<T> {
    onChange: (value: T) => void;
  }

  export interface SelectOption<T> {
    value: T;
    label: string;
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import { writable } from 'svelte/store';
  import { noop, onMount } from 'svelte/internal';

  type T = $$Generic;

  export let show = false;

  export let label = '';
  export let id: string;
  export let value: T = undefined;
  export let dark: boolean = false;
  export let placeholder = '';
  export let disabled: boolean = false;
  export let unroundRight: boolean = false;
  export let keepOpen: boolean = false;
  export let onChange: (value: T) => void = noop;

  const context = writable<SelectContext<T>>({
    value: value,
    // We get the "true" value of this further down but before the mount happens we should have some kind of value
    label: value?.toString(),
    onChange,
  });

  $: {
    $context.value = value;
    $context.label = getLabelFromOptions(value);
  }

  const handleOnChange = (newValue: T) => {
    value = newValue;
    onChange(value);
  };

  function getLabelFromOptions(value: T): string {
    let selectedVal = $optionContext.find((option) => option.value === value);

    if (selectedVal !== undefined) {
      return selectedVal.label;
    }
  }

  const optionContext = writable<SelectOption<T>[]>([]);
  setContext('select-value', context);
  setContext('select-change', handleOnChange);
  setContext('select-options', optionContext);

  onMount(() => {
    // After all the Options are mounted use context to read the label assocaited with the value
    $context.label = getLabelFromOptions(value);
  });
</script>

<div class="select {$$props.class}">
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <MenuContainer class="w-full">
    <MenuButton
      hasIndicator={!disabled}
      class="select-input-container {disabled ? 'disabled' : ''} {unroundRight
        ? 'unroundRight'
        : ''}"
      bind:show
      {keepOpen}
      controls="{id}-menu"
      testId={$$props.testId}
      {dark}
      {disabled}
    >
      <div class="select-input" class:dark class:disabled {id}>
        {#if !value && placeholder !== ''}
          {placeholder}
        {:else}
          {$context.label}
        {/if}
      </div>
      {#if disabled}
        <Icon name="lock" class="text-gray-500" />
      {/if}
    </MenuButton>
    <Menu id="{id}-menu" class="h-auto max-h-96 min-w-fit" {show} {dark}>
      <slot />
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

  .select :global(.unroundRight) {
    @apply rounded-tr-none rounded-br-none border-r-0;
  }

  .select-input {
    @apply inline cursor-pointer truncate bg-white;
  }

  .select-input.dark {
    @apply bg-primary text-white;
  }

  .select-input.disabled {
    @apply bg-gray-50 placeholder:text-gray-600;
  }
</style>
