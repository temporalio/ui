<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import type { IconName } from '$lib/holocene/icon';
  import Input from '$lib/holocene/input/input.svelte';

  import { useFormField } from './use-form-field.svelte';

  interface Props {
    // Form-specific props
    name: string;
    value?: string;
    valid?: boolean;
    error?: boolean;
    hintText?: string;

    // Pass-through props for the base Input component
    type?: HTMLInputAttributes['type'];
    label: string;
    labelHidden?: boolean;
    icon?: IconName;
    placeholder?: string;
    suffix?: string;
    prefix?: string;
    copyable?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    maxLength?: number;
    hideCount?: boolean;
    spellcheck?: boolean;
    noBorder?: boolean;
    autoFocus?: boolean;
    required?: boolean;
    copyButtonLabel?: string;
    clearButtonLabel?: string;
    class?: string;

    // Snippet props for slots
    'before-input'?: import('svelte').Snippet<[{ disabled: boolean }]>;
    'after-input'?: import('svelte').Snippet<[{ disabled: boolean }]>;
  }

  let {
    name,
    value = '',
    valid = true,
    error = false,
    hintText = '',
    type = 'text',
    label,
    labelHidden = false,
    icon = null,
    placeholder = '',
    suffix = '',
    prefix = '',
    copyable = false,
    disabled = false,
    clearable = false,
    autocomplete = 'off',
    maxLength = 0,
    hideCount = false,
    spellcheck = null,
    noBorder = false,
    autoFocus = false,
    required = false,
    copyButtonLabel = '',
    clearButtonLabel = '',
    class: className = '',
    'before-input': beforeInput,
    'after-input': afterInput,
    ...restProps
  }: Props = $props();

  // Generate ID from name if not provided
  let resolvedId = `input-${name}`;

  // Use form field hook for integration
  const formField = useFormField({
    name,
    value,
    valid,
    error,
    hintText,
  });

  // Handle value changes
  function handleInput(event: CustomEvent<{ target: HTMLInputElement }>) {
    const target = event.target as HTMLInputElement;
    formField.setValue(target.value);
  }

  // Handle clear action
  function handleClear() {
    formField.setValue('');
  }
</script>

<Input
  id={resolvedId}
  {name}
  value={formField.bindableValue}
  {label}
  {labelHidden}
  {icon}
  {placeholder}
  {suffix}
  {prefix}
  {copyable}
  {disabled}
  {clearable}
  {autocomplete}
  valid={formField.resolvedValid}
  error={formField.resolvedError}
  hintText={formField.resolvedHintText}
  {maxLength}
  {hideCount}
  {spellcheck}
  {noBorder}
  {autoFocus}
  {required}
  {copyButtonLabel}
  {clearButtonLabel}
  {type}
  class={className}
  on:input={handleInput}
  on:clear={handleClear}
  on:click
  on:keydown
  on:change
  on:focus
  on:blur
  {...formField.resolvedConstraints}
  {...restProps}
>
  <svelte:fragment slot="before-input" let:disabled>
    {#if beforeInput}
      {@render beforeInput({ disabled })}
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="after-input" let:disabled>
    {#if afterInput}
      {@render afterInput({ disabled })}
    {/if}
  </svelte:fragment>
</Input>
