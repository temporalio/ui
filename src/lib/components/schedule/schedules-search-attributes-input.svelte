<script lang="ts">
  import {
    customSearchAttributes,
    type SearchAttributeInput,
  } from '$lib/stores/search-attributes';
  import type { SearchAttribute } from '$lib/types';
  // import { decodePayloadAttributes } from '$lib/utilities/decode-payload';

  import AddSearchAttributes from '../workflow/add-search-attributes.svelte';

  export let searchAttributes: SearchAttribute = {};
  console.log('search attributes input file', searchAttributes);
  // const decodedSearchAttributes = decodePayloadAttributes({ searchAttributes });
  const indexedFields =
    searchAttributes.indexedFields ?? ({} as { [k: string]: string });

  console.log('indexed fields', indexedFields);

  export let searchAttributesInput = Object.entries(indexedFields).map(
    ([label, value]) => ({
      label,
      value,
      type: $customSearchAttributes[label],
    }),
  ) as SearchAttributeInput[];

  console.log('search attributes input', searchAttributesInput);
</script>

<AddSearchAttributes
  bind:attributesToAdd={searchAttributesInput}
  class="w-full"
/>
