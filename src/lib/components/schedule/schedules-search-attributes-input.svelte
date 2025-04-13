<script lang="ts">
  import type { SearchAttributeInput } from '$lib/stores/search-attributes';
  import type { SearchAttribute } from '$lib/types';

  import AddSearchAttributes from '../workflow/add-search-attributes.svelte';

  export let searchAttributes: SearchAttribute = {};
  export let searchAttributesInput: SearchAttributeInput[] = [];
  console.log('search attributes input file', searchAttributes);

  console.log('search attributes input', searchAttributesInput);
</script>

<AddSearchAttributes
  bind:attributesToAdd={searchAttributesInput}
  class="w-full"
/>
