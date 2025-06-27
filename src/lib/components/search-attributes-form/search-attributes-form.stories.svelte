<script lang="ts" context="module">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import { createApiError } from '$lib/utilities/api-error-handler';

  import type {
    SearchAttributeDefinition,
    SearchAttributesAdapter,
    SearchAttributeTypeOption,
  } from './types';

  import SearchAttributesForm from './search-attributes-form.svelte';

  // Mock adapter for testing with data
  class MockAdapter implements SearchAttributesAdapter {
    namespace: string;

    constructor(namespace: string) {
      this.namespace = namespace;
    }

    async fetchAttributes(): Promise<SearchAttributeDefinition[]> {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return [
        { name: 'CustomerId', type: SEARCH_ATTRIBUTE_TYPE.KEYWORD },
        { name: 'Amount', type: SEARCH_ATTRIBUTE_TYPE.DOUBLE },
        { name: 'ProcessedAt', type: SEARCH_ATTRIBUTE_TYPE.DATETIME },
      ];
    }

    async upsertAttributes(
      attributes: SearchAttributeDefinition[],
    ): Promise<void> {
      action('upsertAttributes')(this.namespace, attributes);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    async deleteAttribute(attributeName: string): Promise<void> {
      action('deleteAttribute')(this.namespace, attributeName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    getSupportedTypes(): SearchAttributeTypeOption[] {
      return [
        { label: 'Keyword', value: SEARCH_ATTRIBUTE_TYPE.KEYWORD },
        { label: 'Text', value: SEARCH_ATTRIBUTE_TYPE.TEXT },
        { label: 'Int', value: SEARCH_ATTRIBUTE_TYPE.INT },
        { label: 'Double', value: SEARCH_ATTRIBUTE_TYPE.DOUBLE },
        { label: 'Bool', value: SEARCH_ATTRIBUTE_TYPE.BOOL },
        { label: 'DateTime', value: SEARCH_ATTRIBUTE_TYPE.DATETIME },
        { label: 'KeywordList', value: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST },
      ];
    }
  }

  // Mock adapter for error testing
  class ErrorMockAdapter implements SearchAttributesAdapter {
    namespace: string;

    constructor(namespace: string) {
      this.namespace = namespace;
    }

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
    }

    async upsertAttributes(
      attributes: SearchAttributeDefinition[],
    ): Promise<void> {
      action('upsertAttributes')(this.namespace, attributes);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    async deleteAttribute(attributeName: string): Promise<void> {
      action('deleteAttribute')(this.namespace, attributeName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    getSupportedTypes(): SearchAttributeTypeOption[] {
      return [
        { label: 'Keyword', value: SEARCH_ATTRIBUTE_TYPE.KEYWORD },
        { label: 'Text', value: SEARCH_ATTRIBUTE_TYPE.TEXT },
        { label: 'Int', value: SEARCH_ATTRIBUTE_TYPE.INT },
        { label: 'Double', value: SEARCH_ATTRIBUTE_TYPE.DOUBLE },
        { label: 'Bool', value: SEARCH_ATTRIBUTE_TYPE.BOOL },
        { label: 'DateTime', value: SEARCH_ATTRIBUTE_TYPE.DATETIME },
        { label: 'KeywordList', value: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST },
      ];
    }
  }

  // Mock adapter for empty state testing
  class EmptyMockAdapter implements SearchAttributesAdapter {
    namespace: string;

    constructor(namespace: string) {
      this.namespace = namespace;
    }

    async fetchAttributes(): Promise<SearchAttributeDefinition[]> {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Return empty row for proper empty state display
      return [{ name: '', type: SEARCH_ATTRIBUTE_TYPE.KEYWORD }];
    }

    async upsertAttributes(
      attributes: SearchAttributeDefinition[],
    ): Promise<void> {
      action('upsertAttributes')(this.namespace, attributes);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    async deleteAttribute(attributeName: string): Promise<void> {
      action('deleteAttribute')(this.namespace, attributeName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    getSupportedTypes(): SearchAttributeTypeOption[] {
      return [
        { label: 'Keyword', value: SEARCH_ATTRIBUTE_TYPE.KEYWORD },
        { label: 'Text', value: SEARCH_ATTRIBUTE_TYPE.TEXT },
        { label: 'Int', value: SEARCH_ATTRIBUTE_TYPE.INT },
        { label: 'Double', value: SEARCH_ATTRIBUTE_TYPE.DOUBLE },
        { label: 'Bool', value: SEARCH_ATTRIBUTE_TYPE.BOOL },
        { label: 'DateTime', value: SEARCH_ATTRIBUTE_TYPE.DATETIME },
        { label: 'KeywordList', value: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST },
      ];
    }
  }

  export const meta = {
    title: 'Forms/SearchAttributes',
    component: SearchAttributesForm,
    parameters: {
      layout: 'padded',
      docs: {
        page: () => import('./search-attributes-form.mdx'),
      },
    },
  } satisfies Meta<SearchAttributesForm>;
</script>

<Template let:args>
  <div class="space-y-6">
    <h1 class="text-xl font-bold">Custom Search Attributes for default</h1>
    <SearchAttributesForm {...args} />
  </div>
</Template>

<Story
  name="With Existing Attributes"
  args={{
    adapter: new MockAdapter('default'),
    onSave: action('onSave'),
    onCancel: action('onCancel'),
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
    adapter: new EmptyMockAdapter('empty'),
    onSave: action('onSave'),
    onCancel: action('onCancel'),
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
    adapter: new ErrorMockAdapter('error-namespace'),
    onSave: action('onSave'),
    onCancel: action('onCancel'),
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
