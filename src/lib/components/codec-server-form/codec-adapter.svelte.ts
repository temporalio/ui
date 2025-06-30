import { page } from '$app/state';

import type { Settings } from '$lib/types/global';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type {
  CodecServerAdapter,
  CodecServerFormData,
  CodecServerJsonData,
} from './types';

export const createCodecAdapter = (namespace?: string): CodecServerAdapter => ({
  async fetchCodecServer(): Promise<CodecServerFormData> {
    // Get current settings from page data or fetch fresh
    const settings: Settings = page.data?.settings;

    if (!settings) {
      // Fallback to fetch settings if not available in page data
      const route = routeForApi('settings');
      const response = await requestFromAPI(route);
      // Note: This would need the full settings transformation logic
      // For now, we'll work with what we have
      console.log('Fetched settings:', response);
    }

    // Extract codec settings from current settings
    const codecSettings = settings?.codec;

    return {
      endpoint: codecSettings?.endpoint || '',
      passUserAccessToken: codecSettings?.passAccessToken || false,
      includeCrossOriginCredentials: codecSettings?.includeCredentials || false,
      customMessage: codecSettings?.customErrorMessage?.default?.message || '',
      customLink: codecSettings?.customErrorMessage?.default?.link || '',
    };
  },

  async saveCodecServer(data: CodecServerFormData): Promise<void> {
    // Note: This would need an actual API endpoint for updating codec server settings
    // For now, this is a placeholder that could make a PUT/PATCH request to /api/v1/settings/codec

    // Convert form data to JSON payload
    const jsonData: CodecServerJsonData = {
      endpoint: data.endpoint,
      passUserAccessToken: data.passUserAccessToken,
      includeCrossOriginCredentials: data.includeCrossOriginCredentials,
      ...(data.customMessage && { customMessage: data.customMessage }),
      ...(data.customLink && { customLink: data.customLink }),
    };

    const route = `${routeForApi('settings')}/codec`;

    try {
      await requestFromAPI(route, {
        options: {
          method: 'PUT',
          body: JSON.stringify({
            codecServer: jsonData,
            // Include namespace if this is namespace-scoped
            ...(namespace && { namespace: namespace }),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      });
    } catch (error) {
      // For development, log the data that would be sent
      console.log('Would save codec server settings as JSON:', jsonData);
      throw error;
    }
  },

  onSuccess: (data: CodecServerFormData) => {
    console.log('Codec server configuration saved successfully:', data);
    // Could trigger a settings refresh here
  },

  onCancel: () => {
    console.log('Codec server configuration cancelled');
  },
});
