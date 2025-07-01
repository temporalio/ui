import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import type { SuperFormData } from 'sveltekit-superforms/client';
import { z } from 'zod';

import { translate } from '$lib/i18n/translate';
import type { ApiError } from '$lib/utilities/api-error-handler';

import type {
  SearchAttributeDefinition,
  SearchAttributesAdapter,
  SearchAttributesFormData,
} from './types';

export const addAttribute = (
  attributes: SearchAttributeDefinition[],
  defaultType: string,
): SearchAttributeDefinition[] => {
  return [...attributes, { name: '', type: defaultType }];
};

export const removeAttribute = (
  attributes: SearchAttributeDefinition[],
  index: number,
): SearchAttributeDefinition[] => {
  return attributes.filter((_, i) => i !== index);
};

export const createFormSchema = (supportedTypeValues: string[]) => {
  return z.object({
    attributes: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, translate('search-attributes.validation-name-required')),
          type: z.enum(supportedTypeValues as [string, ...string[]]),
        }),
      )
      .refine(
        (attributes) => {
          const names = attributes.map((attr) => attr.name);
          return names.length === new Set(names).size;
        },
        {
          message: translate('search-attributes.validation-names-unique'),
          path: ['attributes'],
        },
      ),
  });
};

export const createFormConfig = (
  adapter: SearchAttributesAdapter,
  onSave: (attributes: SearchAttributeDefinition[]) => void,
  initialAttributes: SearchAttributeDefinition[],
) => {
  const supportedTypes = adapter.getSupportedTypes();
  const supportedTypeValues = supportedTypes.map((type) => type.value);
  const defaultType = supportedTypes[0]?.value || '';
  const formSchema = createFormSchema(supportedTypeValues);

  const superFormInstance = superForm(
    { attributes: initialAttributes },
    {
      SPA: true,
      dataType: 'json',
      validators: zodClient(formSchema),
      resetForm: false,
      onUpdate: async ({ form }) => {
        if (!form.valid) return;

        try {
          await adapter.upsertAttributes(form.data.attributes);
          onSave(form.data.attributes);
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
    supportedTypes,
    defaultType,
  };
};

export const loadInitialAttributes = async (
  adapter: SearchAttributesAdapter,
): Promise<SearchAttributeDefinition[]> => {
  return adapter.fetchAttributes();
};

export const createFormHandlers = (
  formStore: SuperFormData<SearchAttributesFormData>,
  defaultType: string,
  onCancel: () => void,
  reset: () => void,
) => {
  return {
    addAttribute: () => {
      formStore.update((form: SearchAttributesFormData) => ({
        ...form,
        attributes: addAttribute(form.attributes, defaultType),
      }));
    },

    removeAttribute: (index: number) => {
      formStore.update((form: SearchAttributesFormData) => ({
        ...form,
        attributes: removeAttribute(form.attributes, index),
      }));
    },

    handleCancel: () => {
      reset();
      onCancel();
    },
  };
};
