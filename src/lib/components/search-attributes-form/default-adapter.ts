import { fetchSearchAttributesForNamespace } from '$lib/services/search-attributes-service';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
import { createApiError } from '$lib/utilities/api-error-handler';

import type {
  SearchAttributeDefinition,
  SearchAttributesAdapter,
  SearchAttributeTypeOption,
} from './types';

export class DefaultSearchAttributesAdapter implements SearchAttributesAdapter {
  constructor(
    private namespace: string,
    private request: typeof fetch = fetch,
  ) {}

  async fetchAttributes(): Promise<SearchAttributeDefinition[]> {
    try {
      const response = await fetchSearchAttributesForNamespace(
        this.namespace,
        this.request,
      );

      const attributes = Object.entries(response.customAttributes).map(
        ([name, type]) => ({
          name,
          type,
        }),
      );

      // Always return at least one empty row for the UI
      return attributes.length > 0
        ? attributes
        : [{ name: '', type: this.getSupportedTypes()[0]?.value || '' }];
    } catch (error) {
      throw createApiError(error, 'load search attributes');
    }
  }

  async upsertAttributes(
    _attributes: SearchAttributeDefinition[],
  ): Promise<void> {
    try {
      // TODO: Implement when SDK team adds CRUD endpoints
      throw new Error(
        'CRUD operations will be implemented when SDK team adds endpoints',
      );
    } catch (error) {
      throw createApiError(error, 'save search attributes');
    }
  }

  async deleteAttribute(_attributeName: string): Promise<void> {
    try {
      // TODO: Implement when SDK team adds CRUD endpoints
      throw new Error(
        'CRUD operations will be implemented when SDK team adds endpoints',
      );
    } catch (error) {
      throw createApiError(error, 'delete search attribute');
    }
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
