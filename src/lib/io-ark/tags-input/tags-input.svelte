<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    TagsInputValidityChangeDetails,
    TagsInputValueChangeDetails,
  } from '@ark-ui/svelte/tags-input';

  export interface TagsInputProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id'
  > {
    value?: string[];
    inputValue?: string;
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    max?: number;
    maxLength?: number;
    allowDuplicates?: boolean;
    delimiter?: string | RegExp;
    editable?: boolean;
    addOnPaste?: boolean;
    blurBehavior?: 'clear' | 'add';
    validate?: (details: { inputValue: string; value: string[] }) => boolean;
    clearable?: boolean;
    clearLabel?: string;
    removeLabel?: (tag: string) => string;
    id?: string;
    name?: string;
    class?: string;
    onValueChange?: (details: TagsInputValueChangeDetails) => void;
    onValueInvalid?: (details: TagsInputValidityChangeDetails) => void;
  }
</script>

<script lang="ts">
  import { TagsInput as ArkTagsInput } from '@ark-ui/svelte/tags-input';

  import { IconClose } from '$lib/io/icon';
  import {
    fieldLabelRecipe,
    FieldMessages,
    fieldRequiredIndicatorRecipe,
    getFieldMessageIds,
  } from '$lib/io-ark/field';

  import {
    tagsInputControlRecipe,
    tagsInputIconButtonRecipe,
    tagsInputInputRecipe,
    tagsInputItemInputRecipe,
    tagsInputItemPreviewRecipe,
    tagsInputRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    value = $bindable([]),
    inputValue = $bindable(''),
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    required = false,
    disabled = false,
    readOnly = false,
    placeholder = 'Add a value',
    max,
    maxLength,
    allowDuplicates = false,
    delimiter = ',',
    editable = true,
    addOnPaste = true,
    blurBehavior = 'add',
    validate,
    clearable = false,
    clearLabel = 'Clear all',
    removeLabel = (tag) => `Remove ${tag}`,
    id = generatedId,
    name,
    class: className,
    onValueChange,
    onValueInvalid,
    ...rest
  }: TagsInputProps = $props();

  const isInvalid = $derived(invalid ?? !!error);
  const showError = $derived(!!(isInvalid && error));
  const messageIds = $derived(
    getFieldMessageIds(id, { helperText, showError, errorFirst: true }),
  );
  const isInteractive = $derived(!disabled && !readOnly);
  const atMax = $derived(max !== undefined && value.length >= max);
</script>

<ArkTagsInput.Root
  {id}
  bind:value
  bind:inputValue
  {name}
  {required}
  {disabled}
  {readOnly}
  invalid={isInvalid}
  {max}
  {maxLength}
  {allowDuplicates}
  {delimiter}
  {editable}
  {addOnPaste}
  {blurBehavior}
  {validate}
  {onValueChange}
  {onValueInvalid}
  class={tagsInputRecipe(className)}
  {...rest}
>
  <ArkTagsInput.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
    {label}
    {#if required}
      <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
    {/if}
  </ArkTagsInput.Label>
  <ArkTagsInput.Control class={tagsInputControlRecipe()}>
    {#each value as tag, index (`${tag}-${index}`)}
      <ArkTagsInput.Item {index} value={tag} class="max-w-full">
        <ArkTagsInput.ItemPreview class={tagsInputItemPreviewRecipe()}>
          <ArkTagsInput.ItemText class="truncate">{tag}</ArkTagsInput.ItemText>
          {#if isInteractive}
            <ArkTagsInput.ItemDeleteTrigger
              class={tagsInputIconButtonRecipe('sm')}
              aria-label={removeLabel(tag)}
            >
              <IconClose width={12} height={12} />
            </ArkTagsInput.ItemDeleteTrigger>
          {/if}
        </ArkTagsInput.ItemPreview>
        <ArkTagsInput.ItemInput class={tagsInputItemInputRecipe()} />
      </ArkTagsInput.Item>
    {/each}
    <ArkTagsInput.Input
      placeholder={atMax ? undefined : placeholder}
      aria-describedby={messageIds.describedBy}
      class={tagsInputInputRecipe()}
      data-track-name="tags-input"
      data-track-intent="add"
      data-track-text={label}
    />
    {#if clearable && isInteractive && value.length > 0}
      <ArkTagsInput.ClearTrigger
        class={tagsInputIconButtonRecipe()}
        aria-label={clearLabel}
      >
        <IconClose width={16} height={16} />
      </ArkTagsInput.ClearTrigger>
    {/if}
  </ArkTagsInput.Control>
  <FieldMessages ids={messageIds} {helperText} {error} {showError} />
  <ArkTagsInput.HiddenInput />
</ArkTagsInput.Root>
