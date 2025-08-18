import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { translate } from '$lib/i18n/translate';
import type { ApiError } from '$lib/utilities/api-error-handler';

import type { StartWorkflowAdapter, StartWorkflowFormData } from './types';

export const createFormSchema = () => {
  return z.object({
    id: z.string().uuid(),
    name: z
      .string()
      .min(1, translate('search-attributes.validation-name-required')),
    type: z
      .string()
      .min(1, translate('search-attributes.validation-name-required')),
    taskQueue: z
      .string()
      .min(1, translate('search-attributes.validation-task-queue-required')),
  });
};

export const createFormConfig = (
  adapter: StartWorkflowAdapter,
  initialAttributes: StartWorkflowFormData,
) => {
  const formSchema = createFormSchema();

  const superFormInstance = superForm(
    { ...initialAttributes },
    {
      SPA: true,
      dataType: 'json',
      validators: zodClient(formSchema),
      resetForm: false,
      onUpdate: async ({ form }) => {
        if (!form.valid) return;

        try {
          await adapter.upsertAttributes(form.data);
          await adapter.onSuccess(form.data);
          return translate('search-attributes.save-success');
        } catch (error) {
          // Adapter should return an ApiError with user-friendly message
          const apiError = error as ApiError;
          const errorMessage =
            apiError.userMessage || translate('search-attributes.save-error');

          // Return error result instead of throwing to ensure SuperForms handles it
          throw new Error(errorMessage);
        }
      },
      onError: async ({ result }) => {
        console.error('Form submission error:', result);
        const { message } = superFormInstance;
        message.update(() => {
          return {
            intent: 'error',
            text:
              result.error?.message ||
              translate('search-attributes.save-error-generic'),
            title: translate('search-attributes.error-title'),
          };
        });
      },
    },
  );

  return {
    superFormInstance,
  };
};

export const loadInitialAttributes = async (
  adapter: StartWorkflowAdapter,
): Promise<StartWorkflowFormData> => {
  return adapter.fetchAttributes();
};

export const createFormHandlers = (onCancel: () => void, reset: () => void) => {
  return {
    // addAttribute: () => {
    //   formStore.update((form: SearchAttributesFormData) => ({
    //     ...form,
    //     attributes: addAttribute(form.attributes, defaultType),
    //   }));
    // },

    // removeAttribute: (index: number) => {
    //   formStore.update((form: SearchAttributesFormData) => ({
    //     ...form,
    //     attributes: removeAttribute(form.attributes, index),
    //   }));
    // },

    handleCancel: () => {
      reset();
      onCancel();
    },
  };
};
