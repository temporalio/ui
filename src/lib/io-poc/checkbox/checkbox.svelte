<script lang="ts" module>
  import type { HTMLLabelAttributes } from 'svelte/elements';

  import type {
    CheckboxCheckedChangeDetails,
    CheckboxRootBaseProps,
  } from '@ark-ui/svelte/checkbox';

  export interface CheckboxProps extends Omit<
    HTMLLabelAttributes,
    'class' | 'children' | 'for' | 'form'
  > {
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    checked?: boolean;
    indeterminate?: boolean;
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
    Checkbox as ArkCheckbox,
    useCheckboxGroupContext,
  } from '@ark-ui/svelte/checkbox';

  import { IconCheckmark, IconHyphen } from '$lib/io/icon';
  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
    FieldMessages,
    fieldRequiredIndicatorRecipe,
    getFieldMessageIds,
  } from '$lib/io-poc/field';

  import {
    checkboxControlRecipe,
    checkboxDescriptionRecipe,
    checkboxIndicatorRecipe,
    checkboxLabelRecipe,
    checkboxRecipe,
    checkboxRootRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    checked = $bindable(false),
    indeterminate = false,
    disabled,
    required,
    readOnly,
    name,
    value,
    id,
    onCheckedChange,
    class: className,
    ...rest
  }: CheckboxProps = $props();

  const group = useCheckboxGroupContext();
  const inGroup = $derived(!!group && value !== undefined);
  const baseId = $derived(id ?? generatedId);
  const isInvalid = $derived(invalid ?? (error ? true : undefined));
  const showError = $derived(!!error && isInvalid !== false);
  const messageIds = $derived(
    getFieldMessageIds(baseId, { helperText, showError }),
  );

  const checkedProps: Pick<CheckboxRootBaseProps, 'checked'> = $derived(
    inGroup ? {} : { checked: indeterminate ? 'indeterminate' : checked },
  );

  const machineProps: Partial<CheckboxRootBaseProps> = $derived(
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

  function handleCheckedChange(details: CheckboxCheckedChangeDetails) {
    const nextChecked = details.checked === true;
    if (!inGroup) checked = nextChecked;
    onCheckedChange?.(nextChecked);
  }
</script>

<div class={checkboxRecipe(className)}>
  <ArkCheckbox.Root
    {...checkedProps}
    onCheckedChange={handleCheckedChange}
    data-track-name="checkbox"
    data-track-intent="toggle"
    data-track-text={label}
    {...machineProps}
    {...rest}
    class={checkboxRootRecipe()}
  >
    <ArkCheckbox.Control class={checkboxControlRecipe()}>
      <ArkCheckbox.Indicator>
        <IconCheckmark class={checkboxIndicatorRecipe()} />
      </ArkCheckbox.Indicator>
      <ArkCheckbox.Indicator indeterminate>
        <IconHyphen class={checkboxIndicatorRecipe()} />
      </ArkCheckbox.Indicator>
    </ArkCheckbox.Control>
    <ArkCheckbox.Label class={checkboxLabelRecipe({ hidden: labelHidden })}>
      {label}
      {#if required}
        <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
      {/if}
    </ArkCheckbox.Label>
    <ArkCheckbox.HiddenInput aria-describedby={messageIds.describedBy} />
  </ArkCheckbox.Root>
  <FieldMessages
    ids={messageIds}
    {helperText}
    {error}
    {showError}
    helperClass={checkboxDescriptionRecipe(fieldHelperTextRecipe())}
    errorClass={checkboxDescriptionRecipe(fieldErrorTextRecipe())}
  />
</div>
