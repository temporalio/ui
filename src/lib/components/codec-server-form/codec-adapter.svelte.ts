import { page } from '$app/state';

import { fetchSettings } from '$lib/services/settings-service';
import type { Settings } from '$lib/types/global';

import type { CodecServerAdapter, CodecServerFormData } from './types';

export const createCodecAdapter = (): CodecServerAdapter => ({
  async fetchCodecServer(): Promise<CodecServerFormData> {
    // Get current settings from page data or fetch fresh
    let settings: Settings = page.data?.settings;

    if (!settings) {
      // Fallback to fetch settings if not available in page data
      settings = await fetchSettings();
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
    // Convert form data to API format matching the existing Settings structure
    const codecPayload = {
      Endpoint: data.endpoint,
      PassAccessToken: data.passUserAccessToken,
      IncludeCredentials: data.includeCrossOriginCredentials,
      ...(data.customMessage && { DefaultErrorMessage: data.customMessage }),
      ...(data.customLink && { DefaultErrorLink: data.customLink }),
    };

    // For OSS: cluster-level codec server configuration
    // For now, this logs what would be sent to a codec server settings API
    // In the future, this could be a PUT/PATCH to /api/v1/settings/codec
    console.log('Would save cluster-level codec server settings:', {
      codec: codecPayload,
    });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For development, we can't actually persist these settings
    // but we simulate a successful response
  },

  onSuccess: (data: CodecServerFormData) => {
    console.log('Cluster-level codec server configuration saved:', data);
    // In a real implementation, this might:
    // - Trigger a cluster settings refresh
    // - Update the global page data
    // - Show a success toast
  },

  onCancel: () => {
    console.log('Codec server configuration cancelled');
    // In a real implementation, this might:
    // - Navigate back to cluster settings
    // - Reset any temporary state
  },
});
