<script lang="ts">
  import type { FormEventHandler } from 'svelte/elements';

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
    disableTypeForExisting?: boolean;
    isDeletable: boolean;
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
    disableTypeForExisting = false,
    isDeletable,
    onRemove,
    onNameChange,
    onTypeChange,
  }: Props = $props();

  const isTypeDisabled = $derived(
    submitting || (disableTypeForExisting && !isDeletable),
  );

  const isDeleteDisabled = $derived(submitting || !isDeletable);

  const hasError = $derived(!!error);

  const handleNameInput: FormEventHandler<HTMLInputElement> = (e) => {
    onNameChange(e.currentTarget.value);
  };
</script>

<div class="grid grid-cols-[1fr,200px,auto] gap-3">
  <Input
    id={`attribute-name-${index}`}
    value={name}
    label={translate('search-attributes.attribute-label', {
      index: index + 1,
    })}
    labelHidden
    disabled={submitting}
    error={hasError}
    oninput={handleNameInput}
  />

  <Select
    id={`attribute-type-${index}`}
    value={type}
    label={translate('search-attributes.type-label', {
      index: index + 1,
    })}
    labelHidden
    disabled={isTypeDisabled}
    placeholder={translate('search-attributes.select-type-placeholder')}
    onChange={onTypeChange}
  >
    {#each supportedTypes as type}
      <Option value={type.value}>{type.label}</Option>
    {/each}
  </Select>

  <Button
    variant="ghost"
    size="xs"
    on:click={onRemove}
    disabled={isDeleteDisabled}
    type="button"
    leadingIcon="trash"
  />
</div>

{#if error}
  <div class="col-span-2 mt-1 text-xs text-danger">
    {error}
  </div>
{/if}
