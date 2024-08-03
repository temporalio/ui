<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    customSearchAttributes,
    type SearchAttributeInput,
  } from '$lib/stores/search-attributes';
  import type { SearchAttributes } from '$lib/types/workflows';

  import DatetimeInput from './datetime-input.svelte';
  import NumberInput from './number-input.svelte';
  import TextInput from './text-input.svelte';

  export let attributesToAdd: SearchAttributeInput[] = [];
  export let searchAttributes: SearchAttributes = $customSearchAttributes;
  export let attribute: SearchAttributeInput;
  export let onRemove: (attribute: string) => void;

  $: type = searchAttributes[attribute.attribute];
  $: searchAttributesOptions = [...Object.entries(searchAttributes)]
    .map(([key, value]) => ({ label: key, value: key, type: value }))
    .filter(({ type }) => type !== 'KeywordList');

  $: isDisabled = (value: string) => {
    return !!attributesToAdd.find((a) => a.attribute === value);
  };
</script>

<div class="flex gap-2">
  <Select
    id="search-attribute"
    label={translate('workflows.custom-search-attribute')}
    class="w-full"
    placeholder={translate('workflows.select-attribute')}
    bind:value={attribute.attribute}
    onChange={(attr) => {
      if (type !== searchAttributes[attr]) {
        attribute.value = '';
      }
    }}
  >
    {#each searchAttributesOptions as { value, label, type }}
      <Option disabled={isDisabled(value)} {value} description={type}
        >{label}</Option
      >
    {/each}
  </Select>
  {#if type === 'Bool'}
    <Select
      label={translate('common.value')}
      id="attribute-value"
      bind:value={attribute.value}
    >
      <Option value={true}>{translate('common.true')}</Option>
      <Option value={false}>{translate('common.false')}</Option>
    </Select>
  {:else if type === 'Datetime'}
    <DatetimeInput bind:value={attribute.value} />
  {:else if type === 'Int' || type === 'Double'}
    <NumberInput bind:value={attribute.value} />
  {:else}
    <TextInput bind:value={attribute.value} />
  {/if}
  <Button
    variant="ghost"
    leadingIcon="close"
    class="mt-6 w-10 rounded-full"
    on:click={() => onRemove(attribute.attribute)}
  />
</div>
