<script lang="ts" context="module">
  export type SelectContext<T> = {
    selectValue: T;
    onChange: (value: T) => void;
  };
</script>

<script lang="ts">
  import { onDestroy, setContext } from 'svelte';
  import Icon from '$holocene/icon/icon.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
  import { writable } from 'svelte/store';
  import { noop } from 'svelte/internal';

  type T = $$Generic;

  let show = false;

  export let label = '';
  export let id: string;
  export let value: T = undefined;
  export let dark: boolean = false;
  export let placeholder = '';
  export let disabled: boolean = false;
  export let showIcon: boolean = true;
  export let unroundRight: boolean = false;
  export let displayValue: (value: T) => T | string = (value) => value ?? '';
  export let onChange: (value: T) => void = noop;

  const context = writable<SelectContext<T>>({
    selectValue: value,
    onChange,
  });

  const unsubscribe = context.subscribe((ctx) => {
    value = ctx.selectValue;
  });

  onDestroy(() => {
    unsubscribe();
  });

  $: {
    if (value) {
      context.update((previous) => ({ ...previous, selectValue: value }));
    }

    setContext('select-value', context);
  }
</script>

<div class="select {$$props.class}">
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <MenuContainer class="w-full">
    <MenuButton
      class="select-input-container {disabled ? 'disabled' : ''} {unroundRight
        ? 'unroundRight'
        : ''}"
      bind:show
      controls="{id}-menu"
      data-cy={$$props.dataCy}
      {dark}
      {disabled}
    >
      <div class="select-input" class:dark class:disabled {id}>
        {#if !value && placeholder !== ''}
          {placeholder}
        {:else}
          {displayValue(value)}
        {/if}
      </div>
      {#if showIcon}
        {#if disabled}
          <Icon name="lock" class="text-gray-500" />
        {:else}
          <Icon
            name={show ? 'chevron-up' : 'chevron-down'}
            class="pointer-events-none"
          />
        {/if}
      {/if}
    </MenuButton>
    <Menu id="{id}-menu" class="h-auto max-h-80 min-w-fit" {show} {dark}>
      <slot />
    </Menu>
  </MenuContainer>
</div>

<style lang="postcss">
  label {
    @apply mb-10 text-sm font-medium text-gray-900;
  }

  .select :global(.select-input-container) {
    @apply flex h-8 w-full flex-row items-center justify-between rounded border border-gray-900 bg-white px-2 text-sm text-primary;
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
