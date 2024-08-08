<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    customSearchAttributes,
    type SearchAttributeInput as SAInput,
  } from '$lib/stores/search-attributes';

  import SearchAttributeInput from './search-attribute-input/index.svelte';

  let className = '';
  export { className as class };
  export let attributesToAdd: SAInput[] = [];

  const addSearchAttribute = () => {
    attributesToAdd = [...attributesToAdd, { attribute: '', value: null }];
  };

  $: searchAttributes = Object.keys($customSearchAttributes);

  const onRemove = (attribute: string) => {
    attributesToAdd = attributesToAdd.filter((a) => a.attribute !== attribute);
  };
</script>

<div class="flex flex-col gap-2 {className}">
  {#each attributesToAdd as attribute}
    <SearchAttributeInput {attributesToAdd} bind:attribute {onRemove} />
  {/each}
  <Button
    variant="ghost"
    leadingIcon="add"
    on:click={addSearchAttribute}
    disabled={!searchAttributes.length ||
      attributesToAdd.length === searchAttributes.length ||
      attributesToAdd.filter((a) => a.value === '' || a.value === null).length >
        0}>{translate('workflows.add-search-attribute')}</Button
  >
</div>
