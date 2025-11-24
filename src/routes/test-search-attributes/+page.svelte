<script lang="ts">
  import SearchAttributesFormContent from '$lib/components/search-attributes-form/search-attributes-form-content.svelte';
  import type { SearchAttributeDefinition } from '$lib/components/search-attributes-form/types';

  const initialAttributes: SearchAttributeDefinition[] = [
    { name: 'CustomerId', type: 'Keyword' },
    { name: 'Amount', type: 'Int' },
    { name: 'ProcessedAt', type: 'Datetime' },
  ];

  const getSupportedTypes = () => [
    { label: 'Text', value: 'Text' },
    { label: 'Keyword', value: 'Keyword' },
    { label: 'Int', value: 'Int' },
    { label: 'Double', value: 'Double' },
    { label: 'Bool', value: 'Bool' },
    { label: 'Datetime', value: 'Datetime' },
    { label: 'KeywordList', value: 'KeywordList' },
  ];

  const handleSave = async (attributes: SearchAttributeDefinition[]) => {
    console.log('Saving attributes:', attributes);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleSuccess = (attributes: SearchAttributeDefinition[]) => {
    console.log('Save successful:', attributes);
  };
</script>

<div class="container mx-auto p-8">
  <h1 class="mb-4 text-2xl font-bold">Search Attributes Form Test</h1>
  <p class="text-gray-600 mb-4 text-sm">
    Test page to verify the delete button behavior. Existing attributes should
    have disabled delete buttons.
  </p>

  <SearchAttributesFormContent
    {initialAttributes}
    onSave={handleSave}
    onSuccess={handleSuccess}
    {getSupportedTypes}
  />
</div>
