<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import {
    customSearchAttributes,
    type SearchAttributeInput,
  } from '$lib/stores/search-attributes';

  import StartWorkflowSearchAttributeInput from './start-workflow-search-attribute-input.svelte';

  export let attributesToAdd: SearchAttributeInput[] = [];

  const addSearchAttribute = () => {
    attributesToAdd = [...attributesToAdd, { attribute: '', value: '' }];
  };

  $: searchAttributes = [...Object.entries($customSearchAttributes)].map(
    ([key, value]) => ({ label: key, value: key, type: value }),
  );

  const onRemove = (attribute: string) => {
    attributesToAdd = attributesToAdd.filter((a) => a.attribute !== attribute);
  };
</script>

{#each attributesToAdd as attribute}
  <StartWorkflowSearchAttributeInput
    {attributesToAdd}
    {searchAttributes}
    bind:attribute
    {onRemove}
  />
{/each}
<Button
  variant="ghost"
  leadingIcon="add"
  on:click={addSearchAttribute}
  disabled={!searchAttributes.length ||
    attributesToAdd.length === searchAttributes.length ||
    attributesToAdd.filter((a) => a.value === '').length > 0}
  >Add a Search Attribute</Button
>
