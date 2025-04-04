<script lang="ts">
  import {
    customSearchAttributes,
    type SearchAttributeInput,
  } from '$lib/stores/search-attributes';
  import type { SearchAttribute } from '$lib/types';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';

  import AddSearchAttributes from '../workflow/add-search-attributes.svelte';

  export let searchAttributes: SearchAttribute = {};

  const decodedSearchAttributes = decodePayloadAttributes({ searchAttributes });
  const indexedFields =
    decodedSearchAttributes?.searchAttributes.indexedFields ??
    ({} as { [k: string]: string });

  export let searchAttributesInput = Object.entries(indexedFields).map(
    ([label, value]) => ({
      label,
      value,
      type: $customSearchAttributes[label],
    }),
  ) as SearchAttributeInput[];
</script>

<AddSearchAttributes
  bind:attributesToAdd={searchAttributesInput}
  class="w-full"
/>
