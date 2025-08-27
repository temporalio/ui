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
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { writable, type Writable } from 'svelte/store';

  import { onMount, setContext } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import type { ButtonStyles } from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';

  type T = $$Generic;

  type $$Props = HTMLInputAttributes & {
    label: string;
    id: string;
    labelHidden?: boolean;
    value?: T;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: IconName;
    onChange?: (value: T) => void;
    'data-testid'?: string;
    menuClass?: string;
    variant?: ButtonStyles['variant'];
    required?: boolean;
    valid?: boolean;
    error?: string;
  };

  export let label: string;
  export let labelHidden = false;
  export let id: string;
  export let value: T = undefined;
  export let placeholder = '';
  export let disabled = false;
  export let loading = false;
  export let leadingIcon: IconName = null;
  export let onChange: (value: T) => void = () => {};
  export let menuClass: string | undefined = undefined;
  export let variant: ButtonStyles['variant'] = 'secondary';
  export let required = false;
  export let error = '';
  export let valid = true;

  // We get the "true" value of this further down but before the mount happens we should have some kind of value
  const valueCtx = writable<T>(value);
  const optionsCtx = writable<ExtendedSelectOption<T>[]>([]);
  const labelCtx = writable<string>(value?.toString());
  const open = writable<boolean>(false);

  $: value, updateContext();

  function updateContext() {
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

    return '';
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
  <Label class="pb-1" {label} hidden={labelHidden} for={id} {required} />
  {#key $labelCtx}
    <MenuButton
      class={twMerge('w-full', !valid ? 'border-danger' : undefined)}
      hasIndicator={!disabled}
      disabled={disabled || loading}
      controls="{id}-select"
      {variant}
      data-testid={`${$$restProps['data-testid'] ?? ''}-button`}
      data-track-name="select"
      data-track-intent="select"
      data-track-text={label}
    >
      <slot name="leading" slot="leading">
        {#if leadingIcon}
          <Icon name={leadingIcon} />
        {/if}
      </slot>
      <input
        {id}
        value={!value && placeholder !== '' ? placeholder : $labelCtx}
        tabindex="-1"
        disabled
        class:disabled
        {required}
        aria-required={required}
        {...$$restProps}
      />
      {#if disabled}
        <Icon slot="trailing" name="lock" />
      {:else if loading}
        <Icon name="spinner" class="animate-spin" />
      {/if}
    </MenuButton>
  {/key}
  <Menu role="listbox" id="{id}-select" class={menuClass}>
    <slot />
  </Menu>

  {#if error && !valid}
    <span class="text-xs text-danger">{error}</span>
  {/if}
</MenuContainer>

<style lang="postcss">
  input {
    @apply pointer-events-none w-full grow bg-transparent text-sm;
  }
</style>
