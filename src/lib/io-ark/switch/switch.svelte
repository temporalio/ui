<script lang="ts" module>
  import type { HTMLLabelAttributes } from 'svelte/elements';

  import type { SwitchSize } from './recipe';

  export interface SwitchProps extends Omit<
    HTMLLabelAttributes,
    'class' | 'children' | 'for' | 'form' | 'id' | 'dir'
  > {
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    checked?: boolean;
    size?: SwitchSize;
    disabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    name?: string;
    value?: string;
    id?: string;
    onCheckedChange?: (checked: boolean) => void;
    class?: string;
  }
</script>

<script lang="ts">
  import {
    Switch as ArkSwitch,
    type SwitchCheckedChangeDetails,
    type SwitchRootBaseProps,
  } from '@ark-ui/svelte/switch';

  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
    fieldRequiredIndicatorRecipe,
  } from '$lib/io-ark/field';

  import {
    switchControlRecipe,
    switchDescriptionRecipe,
    switchLabelRecipe,
    switchRecipe,
    switchRootRecipe,
    switchThumbRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    checked = $bindable(false),
    size = 'md',
    disabled,
    required,
    readOnly,
    name,
    value,
    id,
    onCheckedChange,
    class: className,
    ...rest
  }: SwitchProps = $props();

  const baseId = $derived(id ?? generatedId);
  const helperTextId = $derived(`${baseId}-helper-text`);
  const errorTextId = $derived(`${baseId}-error-text`);
  const isInvalid = $derived(invalid ?? (error ? true : undefined));
  const showError = $derived(!!error && isInvalid !== false);
  const describedBy = $derived(
    [helperText && helperTextId, showError && errorTextId]
      .filter(Boolean)
      .join(' ') || undefined,
  );

  const machineProps: Partial<SwitchRootBaseProps> = $derived(
    Object.fromEntries(
      Object.entries({
        disabled,
        required,
        readOnly,
        invalid: isInvalid,
        name,
        value,
        ids: id ? { hiddenInput: id } : undefined,
      }).filter(([, propValue]) => propValue !== undefined),
    ),
  );

  function handleCheckedChange(details: SwitchCheckedChangeDetails) {
    checked = details.checked;
    onCheckedChange?.(details.checked);
  }
</script>

<div class={switchRecipe(className)}>
  <ArkSwitch.Root
    {checked}
    onCheckedChange={handleCheckedChange}
    data-track-name="switch"
    data-track-intent="toggle"
    data-track-text={label}
    {...machineProps}
    {...rest}
    class={switchRootRecipe()}
  >
    <ArkSwitch.Control class={switchControlRecipe(size)}>
      <ArkSwitch.Thumb class={switchThumbRecipe(size)} />
    </ArkSwitch.Control>
    <ArkSwitch.Label class={switchLabelRecipe({ hidden: labelHidden })}>
      {label}
      {#if required}
        <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
      {/if}
    </ArkSwitch.Label>
    <ArkSwitch.HiddenInput aria-describedby={describedBy} />
  </ArkSwitch.Root>
  {#if helperText}
    <p
      id={helperTextId}
      class={switchDescriptionRecipe(size, fieldHelperTextRecipe())}
    >
      {helperText}
    </p>
  {/if}
  {#if showError}
    <p
      id={errorTextId}
      aria-live="polite"
      class={switchDescriptionRecipe(size, fieldErrorTextRecipe())}
    >
      {error}
    </p>
  {/if}
</div>
