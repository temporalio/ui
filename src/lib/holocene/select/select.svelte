<script lang="ts" context="module">
  export const SELECT_CONTEXT = 'select-context';
  type ExtendedSelectOption<T> = {
    nativeElement: HTMLLIElement;
  } & SelectOption<T>;
  export interface SelectContext<T> {
    handleChange: (value: T) => void;
    options: Writable<ExtendedSelectOption<T>[]>;
    selectLabel: Writable<string>;
    selectValue: Writable<T>;
    open: Writable<boolean>;
  }

  export interface SelectOption<T> {
    value: T;
    label: string;
  }
</script>

<script lang="ts">
  import type { IconName } from '../icon/paths';

  import { setContext } from 'svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { MenuContainer, MenuButton, Menu } from '$lib/holocene/menu';
  import { writable, type Writable } from 'svelte/store';
  import { noop, onMount } from 'svelte/internal';

  type T = $$Generic;

  export let label: string;
  export let labelHidden = false;
  export let id: string;
  export let value: T = undefined;
  export let placeholder = '';
  export let disabled: boolean = false;
  export let leadingIcon: IconName = null;
  export let unroundRight: boolean = false;
  export let onChange: (value: T) => void = noop;

  // We get the "true" value of this further down but before the mount happens we should have some kind of value
  const valueCtx = writable<T>(value);
  const optionsCtx = writable<ExtendedSelectOption<T>[]>([]);
  const labelCtx = writable<string>(value?.toString());
  const open = writable<boolean>(false);

  $: {
    $valueCtx = value;
    $labelCtx = getLabelFromOptions(value);
  }

  const handleChange = (newValue: T) => {
    value = newValue;
    onChange(value);
  };

  function getLabelFromOptions(value: T): string {
    const selectedOption = $optionsCtx.find((option) => option.value === value);

    if (selectedOption !== undefined) {
      return selectedOption.label;
    }
  }

  setContext<SelectContext<T>>(SELECT_CONTEXT, {
    selectValue: valueCtx,
    selectLabel: labelCtx,
    options: optionsCtx,
    open,
    handleChange,
  });

  onMount(() => {
    // After all the Options are mounted use context to read the label assocaited with the value
    $labelCtx = getLabelFromOptions(value);
  });
</script>

<MenuContainer class="w-full" {open}>
  <label class:sr-only={labelHidden} for={id}>{label}</label>
  <MenuButton hasIndicator {disabled} controls="{id}-select">
    <Icon slot="leading" name={leadingIcon} />
    <input
      {id}
      value={!value && placeholder !== '' ? placeholder : $labelCtx}
      tabindex="-1"
      class="select-input"
      disabled
      class:disabled
    />
  </MenuButton>
  <Menu role="listbox" id="{id}-select">
    <slot />
  </Menu>
</MenuContainer>

<style lang="postcss">
  .select-input {
    @apply w-full bg-white pointer-events-none;
  }

  .select-input.disabled {
    @apply bg-gray-50;
  }
</style>
