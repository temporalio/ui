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
  import { noop, onMount } from 'svelte/internal';

  type T = $$Generic;

  let show = false;

  export let id: string;
  export let value: T = undefined;
  export let dark: boolean = false;
  export let placeholder = '';
  export let disabled: boolean = false;
  export let showIcon: boolean = true;
  export let displayValue: (value: T, show: boolean) => T | string = (value) =>
    value ?? '';
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

<MenuContainer class="flex w-auto gap-0">
  <MenuButton
    class="{$$props.class} flex w-full flex-row items-center justify-between p-2 text-sm text-primary hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-200 hover:text-gray-900"
    on:click={() => (show = !show)}
    {show}
    controls="{id}-menu"
    data-cy={$$props.dataCy}
    {dark}
    {disabled}
  >
    <div class="select-input" class:dark class:disabled {id}>
      {#if !value && placeholder !== ''}
        {placeholder}
      {:else}
        {displayValue(value, show)}
      {/if}
    </div>
    {#if showIcon}
      {#if disabled}
        <Icon name="lock" class="text-gray-500" />
      {:else}
        <Icon
          name={show ? 'chevron-left' : 'chevron-right'}
          class="pointer-events-none"
        />
      {/if}
    {/if}
  </MenuButton>
  {#if show}
    <div
      class="flex w-full flex-row items-center justify-between px-2 text-sm text-primary"
    >
      <slot />
    </div>
  {/if}
</MenuContainer>

<style lang="postcss">
</style>
