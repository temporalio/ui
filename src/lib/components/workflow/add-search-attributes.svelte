<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    customSearchAttributes,
    type SearchAttributeInput as SAInput,
  } from '$lib/stores/search-attributes';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

  import SearchAttributeInput from './search-attribute-input/index.svelte';

  let className = '';
  export { className as class };
  export let attributesToAdd: SAInput[] = [];

  const addSearchAttribute = () => {
    attributesToAdd = [
      ...attributesToAdd,
      { label: null, value: null, type: SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED },
    ];
  };

  $: searchAttributes = Object.keys($customSearchAttributes);

  const onRemove = (attribute: string) => {
    attributesToAdd = attributesToAdd.filter((a) => a.label !== attribute);
  };
</script>

<div class="flex flex-col gap-4 {className}">
  {#each attributesToAdd as attribute}
    <SearchAttributeInput {attributesToAdd} bind:attribute {onRemove} />
  {/each}
  <Button
    variant="ghost"
    leadingIcon="add"
    class="max-sm:w-full"
    data-testid="add-search-attribute-button"
    on:click={addSearchAttribute}
    disabled={!searchAttributes.length ||
      attributesToAdd.length === searchAttributes.length ||
      attributesToAdd.filter(
        (a) =>
          a.value === '' ||
          a.value === null ||
          (Array.isArray(a.value) && a.value.length === 0),
      ).length > 0}>{translate('workflows.add-search-attribute')}</Button
  >
</div>
