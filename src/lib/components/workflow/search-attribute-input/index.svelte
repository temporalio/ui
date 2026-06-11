<script lang="ts">
  import { untrack } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import NumberInput from '$lib/holocene/input/number-input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    customSearchAttributeOptions,
    customSearchAttributes,
    type SearchAttributeSchema,
    type SearchAttributesSchema,
  } from '$lib/stores/search-attributes';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

  import DatetimeInput from './datetime-input.svelte';

  interface Props {
    attributes: SearchAttributesSchema;
    attribute: SearchAttributeSchema;
    onRemove: (attribute: string) => void;
    id: number;
  }

  let { attributes, attribute = $bindable(), onRemove, id }: Props = $props();

  let type = $state(attribute.type);
  let value = $state(attribute.value);
  let label = $state(attribute.label);

  $effect(() => {
    const v = value;
    // effect should only re-run when the local value state changes
    // changes to attribute should not re-trigger the effect
    untrack(() => {
      attribute.value = v;
    });
  });

  const isDisabled = (v: string) => {
    return label !== v && !!attributes.find((a) => a.label === v);
  };

  const getType = (attr: string) => $customSearchAttributes[attr];

  const handleAttributeChange = (attr: string) => {
    const previousType = type;
    const newType = getType(attr);

    label = attr;
    type = newType;

    if (newType === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST) {
      value = [];
    } else if (previousType !== newType) {
      value = null;
    }

    attribute = { label, value, type };
  };
</script>

<div
  class="flex flex-col gap-2 border-b border-subtle pb-4 sm:flex-row sm:gap-4"
>
  <div class="flex min-w-fit justify-between gap-2 sm:gap-4">
    <div class="grow [&_button]:w-full">
      <Select
        id="search-attribute-{id}"
        data-testid="search-attribute-select"
        label={translate('workflows.custom-search-attribute')}
        placeholder={translate('workflows.select-attribute')}
        bind:value={label}
        onChange={handleAttributeChange}
      >
        {#each $customSearchAttributeOptions as { value, label, type } (value)}
          <Option disabled={isDisabled(value)} {value} description={type}
            >{label}</Option
          >
        {/each}
      </Select>
    </div>
    <Button
      variant="ghost"
      leadingIcon="close"
      data-testid="search-attribute-close-button"
      class="mt-6 w-10 rounded-full sm:hidden"
      on:click={() => onRemove(label)}
    />
  </div>
  {#if type === SEARCH_ATTRIBUTE_TYPE.BOOL}
    <Select
      label={translate('common.value')}
      id="attribute-value-{id}"
      bind:value
    >
      <Option value={true}>{translate('common.true')}</Option>
      <Option value={false}>{translate('common.false')}</Option>
    </Select>
  {:else if type === SEARCH_ATTRIBUTE_TYPE.DATETIME}
    <DatetimeInput bind:value />
  {:else if type === SEARCH_ATTRIBUTE_TYPE.INT || type === SEARCH_ATTRIBUTE_TYPE.DOUBLE}
    <div>
      <NumberInput
        label={translate('common.value')}
        id="attribute-value-{id}"
        valid={value < Number.MAX_SAFE_INTEGER}
        hintText="Number is too large"
        bind:value
        max={Number.MAX_SAFE_INTEGER}
      />
    </div>
  {:else if type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST}
    <ChipInput
      label={translate('common.value')}
      id="attribute-value-{id}"
      bind:chips={value}
      class="w-full"
      removeChipButtonLabel={(chip) =>
        translate('workflows.remove-keyword-label', { keyword: chip })}
    />
  {:else if type === SEARCH_ATTRIBUTE_TYPE.TEXT || type === SEARCH_ATTRIBUTE_TYPE.KEYWORD || type === SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED}
    <Input
      label={translate('common.value')}
      data-testid="custom-search-attribute-value"
      id="attribute-value-{id}"
      class="grow"
      bind:value
    />
  {:else}
    <Input
      label={translate('common.value')}
      id="attribute-value-{id}"
      class="grow"
      placeholder={translate('workflows.unsupported-attribute')}
      error
      disabled
      value=""
    />
  {/if}
  <Button
    variant="ghost"
    leadingIcon="close"
    data-testid="search-attribute-close-button"
    class="mt-6 w-10 rounded-full max-sm:hidden"
    on:click={() => onRemove(label)}
  />
</div>
