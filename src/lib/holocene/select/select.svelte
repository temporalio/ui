<script lang="ts" module>
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

  import {
    type ComponentProps,
    onMount,
    setContext,
    type Snippet,
  } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import type { ButtonStyles } from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';

  type T = $$Generic;

  interface Props extends HTMLInputAttributes {
    label: string;
    id: string;
    children: Snippet;
    labelHidden?: boolean;
    value?: T;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: IconName;
    onChange?: (value: T) => void;
    'data-testid'?: string;
    menuButtonClass?: ClassNameValue;
    menuClass?: ClassNameValue;
    variant?: ButtonStyles['variant'];
    required?: boolean;
    valid?: boolean;
    error?: string;
    position?: ComponentProps<typeof Menu>['position'];
    leading?: Snippet;
  }

  let {
    label,
    id,
    labelHidden = false,
    value = $bindable(undefined),
    placeholder = '',
    disabled = false,
    loading = false,
    leadingIcon = null,
    onChange = () => {},
    menuButtonClass = undefined,
    menuClass = undefined,
    variant = 'secondary',
    required = false,
    error = '',
    valid = true,
    position = undefined,
    leading: leadingProp,
    children,
    ...rest
  }: Props = $props();

  // We get the "true" value of this further down but before the mount happens we should have some kind of value
  const valueCtx = writable<T>(value);
  const optionsCtx = writable<ExtendedSelectOption<T>[]>([]);
  const labelCtx = writable<string>(value?.toString());
  const open = writable<boolean>(false);

  $effect(() => updateContext(value));

  function updateContext(v: T) {
    $valueCtx = v;
    $labelCtx = getLabelFromOptions(v);
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
  <div class="flex flex-col gap-1">
    <Label {label} hidden={labelHidden} for={id} {required} />
    {#key $labelCtx}
      <MenuButton
        class={merge('w-full', !valid && 'border-danger', menuButtonClass)}
        hasIndicator={!disabled}
        disabled={disabled || loading}
        controls="{id}-select"
        {variant}
        data-testid="{rest['data-testid'] ?? id}-button"
        data-track-name="select"
        data-track-intent="select"
        data-track-text={label}
      >
        {#snippet leading()}
          {#if leadingIcon}
            <Icon name={leadingIcon} />
          {:else if leadingProp}
            {@render leadingProp()}
          {/if}
        {/snippet}
        <input
          {id}
          value={!value && placeholder !== '' ? placeholder : $labelCtx}
          tabindex="-1"
          disabled
          class:disabled
          {required}
          aria-required={required}
          {...rest}
        />
        {#snippet trailing()}
          {#if disabled}
            <Icon name="lock" />
          {:else if loading}
            <Icon name="spinner" class="animate-spin" />
          {/if}
        {/snippet}
      </MenuButton>
    {/key}
  </div>
  <Menu role="listbox" id="{id}-select" class={menuClass} {position}>
    {@render children()}
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
