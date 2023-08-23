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

<script lang="ts" generics="T">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { noop, onMount } from 'svelte/internal';
  import { writable, type Writable } from 'svelte/store';
  
  import { setContext } from 'svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';

  type $$Props = HTMLInputAttributes & {
    label: string;
    id: string;
    labelHidden?: boolean;
    value?: T;
    placeholder?: string;
    disabled?: boolean;
    leadingIcon?: IconName;
    unroundRight?: boolean;
    unroundLeft?: boolean;
    onChange?: (value: T) => void;
    'data-testid'?: string;
  };

  export let label: string;
  export let labelHidden = false;
  export let id: string;
  export let value: T = undefined;
  export let placeholder = '';
  export let disabled = false;
  export let leadingIcon: IconName = null;
  export let unroundRight = false;
  export let unroundLeft = false;
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
  <MenuButton
    hasIndicator
    {disabled}
    {unroundLeft}
    {unroundRight}
    controls="{id}-select"
  >
    <Icon slot="leading" name={leadingIcon} />
    <input
      {id}
      value={!value && placeholder !== '' ? placeholder : $labelCtx}
      tabindex="-1"
      class="select-input"
      disabled
      class:disabled
      {...$$restProps}
    />
    {#if disabled}
      <Icon slot="trailing" name="lock" />
    {/if}
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
