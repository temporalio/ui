import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';

import { defaultErrorHandler } from './utils';
import type {
  FormContext,
  OnErrorParams,
  OnUpdateParams,
  SPAFormConfig,
} from '../types';

export function createSPAForm(config: SPAFormConfig): FormContext {
  const {
    schema,
    defaultValues = {},
    onUpdate,
    onError,
    options = {},
  } = config;

  const form = superForm(defaultValues, {
    SPA: true,
    resetForm: options.resetForm ?? false,
    dataType: options.dataType ?? 'json',
    validators: schema ? zodClient(schema) : false,

    onUpdate: async (event) => {
      if (!event.form.valid) return;

      const result = await onUpdate(event as OnUpdateParams);
      return result;
    },

    onError: async (event) => {
      const errorEvent: OnErrorParams = {
        result: event.result as OnErrorParams['result'],
        message: event.result?.error?.message,
      };

      if (onError) {
        await onError(errorEvent);
      } else {
        defaultErrorHandler(errorEvent);
      }
    },
  });

  return {
    get form() {
      return form;
    },
  };
}
