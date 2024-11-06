<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    customSearchAttributes,
    type SearchAttributeInput,
  } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributes,
  } from '$lib/types/workflows';

  import DatetimeInput from './datetime-input.svelte';
  import ListInput from './list-input.svelte';
  import NumberInput from './number-input.svelte';
  import TextInput from './text-input.svelte';

  export let attributesToAdd: SearchAttributeInput[] = [];
  export let searchAttributes: SearchAttributes = $customSearchAttributes;
  export let attribute: SearchAttributeInput;
  export let onRemove: (attribute: string) => void;

  $: type = searchAttributes[attribute.attribute];
  $: searchAttributesOptions = [...Object.entries(searchAttributes)].map(
    ([key, value]) => ({ label: key, value: key, type: value }),
  );

  $: isDisabled = (value: string) => {
    return !!attributesToAdd.find((a) => a.attribute === value);
  };

  const handleAttributeChange = (attr: string) => {
    if (type !== searchAttributes[attr]) {
      attribute.value = null;
    }
  };
</script>

<div class="flex items-end gap-2">
  <div class="min-w-fit">
    <Select
      id="search-attribute"
      label={translate('workflows.custom-search-attribute')}
      class="w-full"
      placeholder={translate('workflows.select-attribute')}
      bind:value={attribute.attribute}
      onChange={handleAttributeChange}
    >
      {#each searchAttributesOptions as { value, label, type }}
        <Option disabled={isDisabled(value)} {value} description={type}
          >{label}</Option
        >
      {/each}
    </Select>
  </div>
  {#if type === SEARCH_ATTRIBUTE_TYPE.BOOL}
    <Select
      label={translate('common.value')}
      id="attribute-value"
      bind:value={attribute.value}
    >
      <Option value={true}>{translate('common.true')}</Option>
      <Option value={false}>{translate('common.false')}</Option>
    </Select>
  {:else if type === SEARCH_ATTRIBUTE_TYPE.DATETIME}
    <DatetimeInput bind:value={attribute.value} />
  {:else if type === SEARCH_ATTRIBUTE_TYPE.INT || type === SEARCH_ATTRIBUTE_TYPE.DOUBLE}
    <NumberInput bind:value={attribute.value} />
  {:else if type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST}
    <ListInput bind:value={attribute.value} />
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
