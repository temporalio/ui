<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    customSearchAttributes,
    type SearchAttributesSchema,
  } from '$lib/stores/search-attributes';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

  import SearchAttributeInput from './search-attribute-input/index.svelte';

  interface Props {
    class?: ClassNameValue;
    attributesToAdd: SearchAttributesSchema;
    buttonCopy?: string;
    variant?: ComponentProps<Button>['variant'];
  }

  let {
    class: className = '',
    attributesToAdd = $bindable(),
    buttonCopy = translate('workflows.add-search-attribute'),
    variant = 'ghost',
  }: Props = $props();

  const addSearchAttribute = () => {
    attributesToAdd = [
      ...attributesToAdd,
      { label: null, value: null, type: SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED },
    ];
  };

  const searchAttributes = $derived(Object.keys($customSearchAttributes));
  const attributes = $derived(attributesToAdd);

  const onRemove = (attribute: string) => {
    attributesToAdd = attributesToAdd.filter((a) => a.label !== attribute);
  };
</script>

<div class={twMerge('flex flex-col gap-4', className)}>
  {#each attributes as attribute, id (`${attribute.label}-${id}`)}
    <SearchAttributeInput
      {id}
      {attributes}
      bind:attribute={attributesToAdd[id]}
      {onRemove}
    />
  {/each}
  <Button
    {variant}
    leadingIcon="add"
    class="max-sm:w-full"
    data-testid="add-search-attribute-button"
    on:click={addSearchAttribute}
    disabled={!searchAttributes.length ||
      attributes.length === searchAttributes.length}>{buttonCopy}</Button
  >
</div>
