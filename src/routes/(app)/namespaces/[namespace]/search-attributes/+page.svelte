<script lang="ts">
  import { page } from '$app/state';

  import SearchAttributesForm from '$lib/components/search-attributes-form/search-attributes-form.svelte';
  import type {
    SearchAttributeDefinition,
    SearchAttributeTypeOption,
  } from '$lib/components/search-attributes-form/types';
  import { translate } from '$lib/i18n/translate';
  import { fetchSearchAttributesForNamespace } from '$lib/services/search-attributes-service';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

  const namespace = $derived(page.params.namespace);

  async function fetchAttributes(): Promise<SearchAttributeDefinition[]> {
    if (!namespace) {
      throw new Error('No namespace found in page params');
    }

    const response = await fetchSearchAttributesForNamespace(namespace);

    const attributes = Object.entries(response.customAttributes).map(
      ([name, type]) => ({
        name,
        type,
      }),
    );

    // Always return at least one empty row for the UI
    return attributes.length > 0
      ? attributes
      : [
          {
            name: '',
            type: getSupportedTypes()[0]?.value || '',
          },
        ];
  }

  async function handleSave(
    _attributes: SearchAttributeDefinition[],
  ): Promise<void> {
    // TODO: Implement when SDK team adds CRUD endpoints
    throw new Error(translate('search-attributes.crud-not-implemented'));
  }

  function handleSuccess(_attributes: SearchAttributeDefinition[]) {
    console.log('Search attributes saved successfully');
    // Add any other success handling here (toasts, navigation, etc.)
  }

  function handleCancel() {
    console.log('Search attributes form cancelled');
    // Add any cancel handling here (navigation, confirmation, etc.)
  }

  function getSupportedTypes(): SearchAttributeTypeOption[] {
    return [
      {
        label: translate('search-attributes.type-keyword'),
        value: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      },
      {
        label: translate('search-attributes.type-text'),
        value: SEARCH_ATTRIBUTE_TYPE.TEXT,
      },
      {
        label: translate('search-attributes.type-int'),
        value: SEARCH_ATTRIBUTE_TYPE.INT,
      },
      {
        label: translate('search-attributes.type-double'),
        value: SEARCH_ATTRIBUTE_TYPE.DOUBLE,
      },
      {
        label: translate('search-attributes.type-bool'),
        value: SEARCH_ATTRIBUTE_TYPE.BOOL,
      },
      {
        label: translate('search-attributes.type-datetime'),
        value: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      },
      {
        label: translate('search-attributes.type-keywordlist'),
        value: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
      },
    ];
  }

  const initialAttributesPromise = fetchAttributes();
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

  <SearchAttributesForm
    {initialAttributesPromise}
    onSave={handleSave}
    onSuccess={handleSuccess}
    onCancel={handleCancel}
    {getSupportedTypes}
  />
</div>
