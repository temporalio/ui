import { superForm } from 'sveltekit-superforms';

import { defaultErrorHandler } from './base';
import type { FormContext, OnErrorParams, ServerFormConfig } from '../types';

export function createServerForm(config: ServerFormConfig): FormContext {
  const { data, onError, options = {} } = config;

  const form = superForm(data, {
    resetForm: options.resetForm ?? true,
    applyAction: options.applyAction ?? true,
    invalidateAll: options.invalidateAll ?? false,

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
