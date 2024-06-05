<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import type {
    SearchAttributeInput,
    SearchAttributeOption,
  } from '$lib/stores/search-attributes';

  export let attributesToAdd: SearchAttributeInput[] = [];
  export let searchAttributes: SearchAttributeOption[] = [];
  export let attribute: SearchAttributeInput;
  export let onRemove: (attribute: string) => void;

  $: type =
    searchAttributes.find((a) => a.value === attribute.attribute)?.type ?? '';

  $: isDisabled = (value: string) => {
    return !!attributesToAdd.find((a) => a.attribute === value);
  };
</script>

<div class="flex items-end items-center justify-between gap-2">
  <Select
    id="search-attribute"
    label="Custom Search Attribute"
    placeholder="Select Attribute"
    bind:value={attribute.attribute}
  >
    {#each searchAttributes as { value, label, type }}
      <Option disabled={isDisabled(value)} {value} description={type}
        >{label}</Option
      >
    {/each}
  </Select>
  {#if type === 'Bool'}
    <Select
      class="w-full"
      label="Value"
      id="attribute-value"
      bind:value={attribute.value}
    >
      <Option value={true}>True</Option>
      <Option value={false}>False</Option>
    </Select>
  {:else if type === 'Datetime'}
    <Input
      label="Value"
      id="attribute-value"
      type="datetime-local"
      class="w-full"
      bind:value={attribute.value}
    />
  {:else}
    <Input
      label="Value"
      id="attribute-value"
      class="w-full"
      bind:value={attribute.value}
    />
  {/if}
  <Button
    variant="secondary"
    leadingIcon="close"
    class="mt-6"
    on:click={() => onRemove(attribute.attribute)}
  />
</div>
