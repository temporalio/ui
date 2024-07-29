<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    SearchAttributeInput,
    SearchAttributeOption,
  } from '$lib/stores/search-attributes';

  export let attributesToAdd: SearchAttributeInput[] = [];
  export let searchAttributes: SearchAttributeOption[] = [];
  export let attribute: SearchAttributeInput;
  export let onRemove: (attribute: string) => void;

  $: type = getType(searchAttributes, attribute.attribute);

  $: isDisabled = (value: string) => {
    return !!attributesToAdd.find((a) => a.attribute === value);
  };

  function getType(
    searchAttributes: SearchAttributeOption[],
    attribute: string,
  ): string {
    return searchAttributes.find((a) => a.value === attribute)?.type ?? '';
  }
</script>

<div class="flex gap-2">
  <Select
    id="search-attribute"
    label={translate('workflows.custom-search-attribute')}
    class="w-full"
    placeholder={translate('workflows.select-attribute')}
    bind:value={attribute.attribute}
    onChange={(value) => {
      if (type !== getType(searchAttributes, value)) {
        attribute.value = '';
      }
    }}
  >
    {#each searchAttributes as { value, label, type }}
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
      bind:value={attribute.value}
    />
  {:else}
    <Input
      label={translate('common.value')}
      id="attribute-value"
      class="grow"
      bind:value={attribute.value}
    />
  {/if}
  <Button
    variant="ghost"
    leadingIcon="close"
    class="mt-6 w-10 rounded-full"
    on:click={() => onRemove(attribute.attribute)}
  />
</div>
