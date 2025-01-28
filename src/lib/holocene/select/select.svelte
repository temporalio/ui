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

  import { onMount, setContext, type Snippet } from 'svelte';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import type { MenuButtonVariant } from '$lib/holocene/menu/menu-button.svelte';

  type T = $$Generic;

  type $$Props = HTMLInputAttributes & {
    label: string;
    id: string;
    labelHidden?: boolean;
    value?: T;
    placeholder?: string;
    disabled?: boolean;
    leadingIcon?: IconName;
    onChange?: (value: T) => void;
    'data-testid'?: string;
    menuClass?: string;
    variant?: MenuButtonVariant;
    required?: boolean;
    icon?: Snippet;
  };

  let {
    label,
    labelHidden = false,
    id,
    value = $bindable(),
    placeholder = '',
    disabled = false,
    leadingIcon = null,
    onChange = () => {},
    menuClass = undefined,
    variant = 'secondary',
    required = false,
    children,
    'data-testid': testId = '',
    icon,
  }: $$Props = $props();

  // We get the "true" value of this further down but before the mount happens we should have some kind of value
  const valueCtx = writable<T>(value);
  const optionsCtx = writable<ExtendedSelectOption<T>[]>([]);
  const labelCtx = writable<string>(value?.toString());
  const open = writable<boolean>(false);

  $effect(() => {
    updateContext(value);
  });

  function updateContext(_value) {
    $valueCtx = _value;
    $labelCtx = getLabelFromOptions(_value);
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

<MenuContainer {open}>
  <Label class="pb-1" {label} hidden={labelHidden} for={id} {required} />
  {#key $labelCtx}
    <MenuButton
      hasIndicator={!disabled}
      {disabled}
      controls="{id}-select"
      {variant}
      data-testid={`${testId}-button`}
    >
      {#snippet leading()}
        {#if icon}
          {@render icon()}
        {:else if leadingIcon}
          <Icon name={leadingIcon} />
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
      />
      {#snippet trailing()}
        {#if disabled}
          <Icon name="lock" />
        {/if}
      {/snippet}
    </MenuButton>
  {/key}
  <Menu role="listbox" id="{id}-select" class={menuClass}>
    {@render children?.()}
  </Menu>
</MenuContainer>

<style lang="postcss">
  input {
    @apply pointer-events-none w-full bg-transparent text-sm;
  }
</style>
