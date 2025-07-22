import { page } from '$app/state';

import { translate } from '$lib/i18n/translate';
import { fetchSearchAttributesForNamespace } from '$lib/services/search-attributes-service';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
import { createApiError } from '$lib/utilities/api-error-handler';

import type {
  SearchAttributeDefinition,
  SearchAttributesAdapter,
  SearchAttributeTypeOption,
} from './types';

export const defaultAdapter: SearchAttributesAdapter = {
  onSuccess: async (attributes) => {
    console.log('Search attributes saved successfully:', attributes);
    // Add any other success handling here (toasts, navigation, etc.)
  },

  onCancel: () => {
    console.log('Search attributes form cancelled');
    // Add any cancel handling here (navigation, confirmation, etc.)
  },

  async fetchAttributes(): Promise<SearchAttributeDefinition[]> {
    try {
      const namespace = page.params.namespace;
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
              type: defaultAdapter.getSupportedTypes()[0]?.value || '',
            },
          ];
    } catch (error) {
      throw createApiError(error, 'load search attributes');
    }
  },

  async upsertAttributes(
    _attributes: SearchAttributeDefinition[],
  ): Promise<void> {
    try {
      // TODO: Implement when SDK team adds CRUD endpoints
      throw new Error(translate('search-attributes.crud-not-implemented'));
    } catch (error) {
      throw createApiError(error, 'save search attributes');
    }
  },

  async deleteAttribute(_attributeName: string): Promise<void> {
    try {
      // TODO: Implement when SDK team adds CRUD endpoints
      throw new Error(translate('search-attributes.crud-not-implemented'));
    } catch (error) {
      throw createApiError(error, 'delete search attribute');
    }
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
