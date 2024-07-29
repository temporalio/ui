<script lang="ts">
  import * as dateTz from 'date-fns-tz';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    customSearchAttributes,
    type SearchAttributeInput,
    type SearchAttributeInputValue,
  } from '$lib/stores/search-attributes';
  import type { SearchAttributes } from '$lib/types/workflows';

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

  function updateDatetime(e: Event & { target: HTMLInputElement }) {
    attribute.value = new Date(e.target.value);
  }

  const dateFormat = "yyyy-MM-dd'T'hh:mm";

  function formatDate(value: SearchAttributeInputValue): string {
    if (!value) return '';
    if (typeof value === 'string' || typeof value === 'number') {
      return dateTz.format(new Date(String(value)), dateFormat);
    } else {
      return dateTz.format(value, dateFormat);
    }
  }
</script>

<div class="flex gap-2">
  <Select
    id="search-attribute"
    label={translate('workflows.custom-search-attribute')}
    class="w-full"
    placeholder={translate('workflows.select-attribute')}
    bind:value={attribute.attribute}
    onChange={() => {
      if (type !== searchAttributes[attribute.attribute]) {
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
    <Input
      label={translate('common.value')}
      id="attribute-value"
      type="datetime-local"
      value={formatDate(attribute.value)}
      on:input={updateDatetime}
    />
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
