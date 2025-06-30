import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { createApiError } from '$lib/utilities/api-error-handler';

import type { CodecServerAdapter, CodecServerFormData } from './types';

const codecServerSchema = z.object({
  endpoint: z
    .string()
    .url('Please enter a valid URL')
    .min(1, 'Endpoint is required'),
  passUserAccessToken: z.boolean(),
  includeCrossOriginCredentials: z.boolean(),
  customMessage: z.string().optional(),
  customLink: z
    .string()
    .refine((val) => val === '' || z.string().url().safeParse(val).success, {
      message: 'Please enter a valid URL',
    })
    .optional(),
});

export const loadInitialData = async (adapter: CodecServerAdapter) => {
  return await adapter.fetchCodecServer();
};

export const createFormConfig = (
  adapter: CodecServerAdapter,
  onSuccess: (data: CodecServerFormData) => void,
  initialData: CodecServerFormData,
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
          await adapter.saveCodecServer(form.data);
          onSuccess(form.data);
          return 'Codec server configuration saved successfully';
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
