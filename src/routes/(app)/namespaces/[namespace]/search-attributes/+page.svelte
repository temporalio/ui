<script lang="ts">
  import { defaultAdapter } from '$lib/components/search-attributes-form/default-adapter.svelte';
  import SearchAttributesForm from '$lib/components/search-attributes-form/search-attributes-form.svelte';
</script>

<svelte:head>
  <title>Custom Search Attributes</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold">Custom Search Attributes</h1>
    <p class="text-gray-600 mt-2">
      Manage custom search attributes for this namespace.
    </p>
  </div>

  <SearchAttributesForm adapter={defaultAdapter} />
</div>
