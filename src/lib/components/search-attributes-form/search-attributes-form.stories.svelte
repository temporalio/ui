<script lang="ts" context="module">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import { translate } from '$lib/i18n/translate';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

  import type {
    SearchAttributeDefinition,
    SearchAttributeTypeOption,
  } from './types';

  import SearchAttributesForm from './search-attributes-form.svelte';

  // Mock data fetcher with existing attributes
  async function fetchAttributesWithData(): Promise<
    SearchAttributeDefinition[]
  > {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return [
      {
        name: 'CustomerId',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        isDeletable: false,
      },
      {
        name: 'Amount',
        type: SEARCH_ATTRIBUTE_TYPE.DOUBLE,
        isDeletable: false,
      },
      {
        name: 'ProcessedAt',
        type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
        isDeletable: false,
      },
    ];
  }

  // Mock data fetcher with error
  async function fetchAttributesWithError(): Promise<
    SearchAttributeDefinition[]
  > {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Simulate a network error
    throw new Error('Failed to load search attributes: Internal Server Error');
  }

  // Mock data fetcher for empty state
  async function fetchAttributesEmpty(): Promise<SearchAttributeDefinition[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Return empty row for proper empty state display
    return [{ name: '', type: SEARCH_ATTRIBUTE_TYPE.KEYWORD }];
  }

  // Mock save handler
  async function handleSave(
    attributes: SearchAttributeDefinition[],
  ): Promise<void> {
    action('onSave')(attributes);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Mock success handler
  function handleSuccess(attributes: SearchAttributeDefinition[]) {
    action('onSuccess')(attributes);
  }

  // Mock cancel handler
  function handleCancel() {
    action('onCancel')();
  }

  // Get supported types function
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

  export const meta = {
    title: 'Forms/SearchAttributes',
    component: SearchAttributesForm,
    parameters: {
      layout: 'padded',
    },
  } satisfies Meta<SearchAttributesForm>;
</script>

<Template let:args>
  <div class="space-y-6">
    <h1 class="text-sm font-medium">
      {translate('search-attributes.story-title', { namespace: 'default' })}
    </h1>
    <SearchAttributesForm {...args} />
  </div>
</Template>

<Story
  name="With Existing Attributes"
  args={{
    initialAttributesPromise: fetchAttributesWithData(),
    onSave: handleSave,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
    getSupportedTypes,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Form pre-populated with existing search attributes. Shows skeleton loading state, allows CRUD operations, and includes form validation.',
      },
    },
  }}
/>

<Story
  name="Empty State"
  args={{
    initialAttributesPromise: fetchAttributesEmpty(),
    onSave: handleSave,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
    getSupportedTypes,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Form in empty state with one empty row ready for input. Shows skeleton loading before displaying empty form. Save button disabled until valid attributes are added.',
      },
    },
  }}
/>

<Story
  name="Error State"
  args={{
    initialAttributesPromise: fetchAttributesWithError(),
    onSave: handleSave,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
    getSupportedTypes,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Form that encounters a server error when loading. Shows error handling with retry functionality and detailed error messages.',
      },
    },
  }}
/>
