<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { SearchAttributeTypeOption } from './types';

  interface Props {
    name: string;
    type: string;
    index: number;
    supportedTypes: SearchAttributeTypeOption[];
    submitting: boolean;
    error?: string;
    hideDeleteButton?: boolean;
    disableTypeForExisting?: boolean;
    initialAttributeNames: Set<string>;
    onRemove: () => void;
    onNameChange: (value: string) => void;
    onTypeChange: (value: string) => void;
  }

  let {
    name,
    type,
    index,
    supportedTypes,
    submitting,
    error,
    hideDeleteButton = false,
    disableTypeForExisting = false,
    initialAttributeNames,
    onRemove,
    onNameChange,
    onTypeChange,
  }: Props = $props();

  const isTypeDisabled = $derived(
    submitting ||
      (disableTypeForExisting && name && initialAttributeNames.has(name)),
  );

  const hasError = $derived(!!error);

  const inputProps = $derived({
    id: `attribute-name-${index}`,
    value: name,
    label: translate('search-attributes.attribute-label', {
      index: index + 1,
    }),
    labelHidden: true,
    disabled: submitting,
    error: hasError,
    oninput: (e: Event) =>
      onNameChange((e.currentTarget as HTMLInputElement).value),
  });

  const selectProps = $derived({
    id: `attribute-type-${index}`,
    value: type,
    label: translate('search-attributes.type-label', {
      index: index + 1,
    }),
    labelHidden: true,
    disabled: isTypeDisabled,
    placeholder: translate('search-attributes.select-type-placeholder'),
    onchange: (e: Event) =>
      onTypeChange((e.currentTarget as HTMLSelectElement).value),
  });
</script>

<div
  class="grid gap-3"
  class:grid-cols-[1fr,200px,auto]={!hideDeleteButton}
  class:grid-cols-[1fr,200px]={hideDeleteButton}
>
  <Input {...inputProps} />

  <Select {...selectProps}>
    {#each supportedTypes as type}
      <Option value={type.value}>{type.label}</Option>
    {/each}
  </Select>

  {#if !hideDeleteButton}
    <Button
      variant="ghost"
      size="xs"
      on:click={onRemove}
      disabled={submitting}
      type="button"
      leadingIcon="trash"
    />
  {/if}
</div>

{#if error}
  <div class="col-span-2 mt-1 text-xs text-danger">
    {error}
  </div>
{/if}
