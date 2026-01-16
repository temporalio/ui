<script lang="ts">
  import type { ComponentProps } from 'svelte';

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
  export let buttonCopy = translate('workflows.add-search-attribute');
  export let variant: ComponentProps<Button>['variant'] = 'ghost';

  const addSearchAttribute = () => {
    attributesToAdd = [
      ...attributesToAdd,
      { label: null, value: null, type: SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED },
    ];
  };

  $: searchAttributes = Object.keys($customSearchAttributes);

  $: attributes = attributesToAdd;

  const onRemove = (attribute: string) => {
    attributesToAdd = attributesToAdd.filter((a) => a.label !== attribute);
  };
</script>

<div class="flex flex-col gap-4 {className}">
  {#each attributes as attribute, id}
    <SearchAttributeInput {id} {attributes} bind:attribute {onRemove} />
  {/each}
  <Button
    {variant}
    leadingIcon="add"
    class="max-sm:w-full"
    data-testid="add-search-attribute-button"
    on:click={addSearchAttribute}
    disabled={!searchAttributes.length ||
      attributes.length === searchAttributes.length ||
      attributes.filter(
        (a) =>
          a.value === '' ||
          a.value === null ||
          (Array.isArray(a.value) && a.value.length === 0),
      ).length > 0}>{buttonCopy}</Button
  >
</div>
