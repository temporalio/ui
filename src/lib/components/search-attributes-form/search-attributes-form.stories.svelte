<script lang="ts" context="module">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import { translate } from '$lib/i18n/translate';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import { createApiError } from '$lib/utilities/api-error-handler';

  import type {
    SearchAttributeDefinition,
    SearchAttributesAdapter,
    SearchAttributeTypeOption,
  } from './types';

  import SearchAttributesForm from './search-attributes-form.svelte';

  // Mock adapter for testing with data - similar to default adapter pattern
  const mockAdapter: SearchAttributesAdapter = {
    onSuccess: async (attributes) => {
      action('onSuccess')(attributes);
    },

    onCancel: () => {
      action('onCancel')();
    },

    async fetchAttributes(): Promise<SearchAttributeDefinition[]> {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return [
        { name: 'CustomerId', type: SEARCH_ATTRIBUTE_TYPE.KEYWORD },
        { name: 'Amount', type: SEARCH_ATTRIBUTE_TYPE.DOUBLE },
        { name: 'ProcessedAt', type: SEARCH_ATTRIBUTE_TYPE.DATETIME },
      ];
    },

    async upsertAttributes(
      attributes: SearchAttributeDefinition[],
    ): Promise<void> {
      action('upsertAttributes')(attributes);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },

    async deleteAttribute(attributeName: string): Promise<void> {
      action('deleteAttribute')(attributeName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },

    getSupportedTypes(): SearchAttributeTypeOption[] {
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
    },
  };

  // Mock adapter for error testing
  const errorMockAdapter: SearchAttributesAdapter = {
    onSuccess: async (attributes) => {
      action('onSuccess')(attributes);
    },

    onCancel: () => {
      action('onCancel')();
    },

    async fetchAttributes(): Promise<SearchAttributeDefinition[]> {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Simulate a network error
      const networkError = new Error('Network error') as Error & {
        statusCode: number;
        statusText: string;
        response: Record<string, unknown>;
      };
      networkError.statusCode = 500;
      networkError.statusText = 'Internal Server Error';
      networkError.response = {};
      throw createApiError(networkError, 'load search attributes');
    },

    async upsertAttributes(
      attributes: SearchAttributeDefinition[],
    ): Promise<void> {
      action('upsertAttributes')(attributes);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },

    async deleteAttribute(attributeName: string): Promise<void> {
      action('deleteAttribute')(attributeName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },

    getSupportedTypes(): SearchAttributeTypeOption[] {
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
    },
  };

  // Mock adapter for empty state testing
  const emptyMockAdapter: SearchAttributesAdapter = {
    onSuccess: async (attributes) => {
      action('onSuccess')(attributes);
    },

    onCancel: () => {
      action('onCancel')();
    },

    async fetchAttributes(): Promise<SearchAttributeDefinition[]> {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Return empty row for proper empty state display
      return [{ name: '', type: SEARCH_ATTRIBUTE_TYPE.KEYWORD }];
    },

    async upsertAttributes(
      attributes: SearchAttributeDefinition[],
    ): Promise<void> {
      action('upsertAttributes')(attributes);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },

    async deleteAttribute(attributeName: string): Promise<void> {
      action('deleteAttribute')(attributeName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },

    getSupportedTypes(): SearchAttributeTypeOption[] {
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
    },
  };

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
    adapter: mockAdapter,
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
    adapter: emptyMockAdapter,
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
    adapter: errorMockAdapter,
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
