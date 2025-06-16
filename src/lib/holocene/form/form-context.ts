import type { ActionResult } from '@sveltejs/kit';
import { getContext, setContext } from 'svelte';
import { superForm, type SuperValidated } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { toaster } from '$lib/stores/toaster';

export type OnUpdateParams = {
  form: SuperValidated<
    Record<string, unknown>,
    unknown,
    Record<string, unknown>
  >;
  cancel: () => void;
  result: Required<
    Extract<
      ActionResult,
      {
        type: 'success' | 'failure';
      }
    >
  >;
};

export type OnErrorParams = {
  result: ActionResult & { type: 'error' };
  message?: string;
};

export type MaybePromise<T> = T | Promise<T>;

export interface BaseSPAFormConfig {
  schema?: z.ZodObject<z.ZodRawShape>;
  defaultValues?: Record<string, unknown>;
  onUpdate: (event: OnUpdateParams) => MaybePromise<unknown | void> | undefined;
  onError?: (event: OnErrorParams) => MaybePromise<void> | undefined;
}

export interface FormContextParams {
  config: BaseSPAFormConfig;
}

export interface FormContext {
  form: ReturnType<typeof superForm>;
}

export const formKey = Symbol('form');

export function formatErrorMessage(event: OnErrorParams): string {
  // Prioritize custom message, then result error message, then fallback
  return (
    event.message ||
    event.result?.error?.message ||
    'An unexpected error occurred. Please try again.'
  );
}

function defaultErrorHandler(event: OnErrorParams): void {
  toaster.push({
    message: formatErrorMessage(event),
    variant: 'error',
  });
}

export function createFormContext(params: FormContextParams): FormContext {
  const { schema, defaultValues = {}, onUpdate, onError } = params.config;

  const f = superForm(defaultValues, {
    resetForm: false,
    dataType: 'json',
    SPA: true,
    validators: schema ? zodClient(schema) : false,

    onUpdate: async (event) => {
      const result = await onUpdate(event as OnUpdateParams);
      return result;
    },

    onError: async (event) => {
      const errorEvent: OnErrorParams = {
        result: event.result as ActionResult & { type: 'error' },
        message: event.result?.error?.message,
      };

      if (onError) {
        await onError(errorEvent);
      } else {
        defaultErrorHandler(errorEvent);
      }
    },
  });

  const context: FormContext = {
    get form() {
      return f;
    },
  };

  setContext(formKey, context);

  return context;
}

export function getFormContext(): FormContext | undefined {
  return getContext(formKey);
}
