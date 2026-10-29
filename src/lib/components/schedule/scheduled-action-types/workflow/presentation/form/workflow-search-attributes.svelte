<script lang="ts">
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import type { SearchAttributesSchema } from '$lib/stores/search-attributes';

  interface Props {
    attributes: SearchAttributesSchema;
  }

  let { attributes = $bindable() }: Props = $props();
</script>

<AddSearchAttributes
  variant="secondary"
  bind:attributesToAdd={attributes}
  class="w-full"
/>
