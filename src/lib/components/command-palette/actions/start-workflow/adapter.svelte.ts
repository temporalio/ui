import { page } from '$app/state';

import { createApiError } from '$lib/utilities/api-error-handler';

import type { StartWorkflowAdapter, StartWorkflowFormData } from './types';

export const defaultAdapter: StartWorkflowAdapter = {
  onSuccess: async (attributes) => {
    console.log('Search attributes saved successfully:', attributes);
    // Add any other success handling here (toasts, navigation, etc.)
  },

  onCancel: () => {
    console.log('Search attributes form cancelled');
    // Add any cancel handling here (navigation, confirmation, etc.)
  },

  async fetchAttributes(): Promise<StartWorkflowFormData> {
    try {
      const namespace = page.params.namespace;
      if (!namespace) {
        throw new Error('No namespace found in page params');
      }

      // const response = await fetchSearchAttributesForNamespace(namespace);
      return {};
    } catch (error) {
      throw createApiError(error, 'load search attributes');
    }
  },
};
