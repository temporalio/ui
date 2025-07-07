import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { translate } from '$lib/i18n/translate';
import { createApiError } from '$lib/utilities/api-error-handler';

import type { CodecServerAdapter, CodecServerFormData } from './types';

const codecServerSchema = z.object({
  endpoint: z
    .string()
    .url(translate('codec-server.validation-endpoint-url'))
    .min(1, translate('codec-server.validation-endpoint-required')),
  passUserAccessToken: z.boolean(),
  includeCrossOriginCredentials: z.boolean(),
  customMessage: z.string().optional(),
  customLink: z
    .string()
    .refine((val) => val === '' || z.string().url().safeParse(val).success, {
      message: translate('codec-server.validation-custom-link-url'),
    })
    .optional(),
});

export const loadInitialData = async (adapter: CodecServerAdapter) => {
  return await adapter.fetchCodecServer();
};

export const createFormConfig = (
  adapter: CodecServerAdapter,
  initialData: CodecServerFormData,
  showCustomSection: () => boolean,
) => {
  const superFormInstance = superForm(
    {
      endpoint: initialData.endpoint || '',
      passUserAccessToken: initialData.passUserAccessToken || false,
      includeCrossOriginCredentials:
        initialData.includeCrossOriginCredentials || false,
      customMessage: initialData.customMessage || '',
      customLink: initialData.customLink || '',
    },
    {
      SPA: true,
      dataType: 'json',
      resetForm: false,
      validators: zodClient(codecServerSchema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;

        try {
          const dataToSave = {
            ...form.data,
            customMessage: showCustomSection() ? form.data.customMessage : '',
            customLink: showCustomSection() ? form.data.customLink : '',
          };
          await adapter.saveCodecServer(dataToSave);
          await adapter.onSuccess(dataToSave);
          return translate('codec-server.save-success');
        } catch (error) {
          console.error('Failed to save codec server configuration:', error);
          throw createApiError(error, 'save codec server configuration');
        }
      },
    },
  );

  return { superFormInstance };
};

export const createFormHandlers = (
  adapter: CodecServerAdapter,
  reset: () => void,
) => {
  const handleCancel = () => {
    reset();
    adapter.onCancel?.();
  };

  return { handleCancel };
};
