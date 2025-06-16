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

export type MaybePromise<T> = T | Promise<T>;

export interface BaseSPAFormParams {
  schema?: z.ZodObject<z.ZodRawShape>;
  defaultValues?: Record<string, unknown>;
  onUpdate: (event: OnUpdateParams) => MaybePromise<unknown | void> | undefined;
}

export type FormContextParams = BaseSPAFormParams;

export interface FormContext {
  form: ReturnType<typeof superForm>;
}

export const formKey = Symbol('form');

export function createFormContext(params: FormContextParams): FormContext {
  const { schema, defaultValues = {}, onUpdate } = params;

  const f = superForm(defaultValues, {
    resetForm: false,
    dataType: 'json',
    SPA: true,
    validators: schema ? zodClient(schema) : false,

    onUpdate: async (event) => {
      const result = await onUpdate(event as OnUpdateParams);
      return result;
    },

    onError: ({ result }) => {
      toaster.push({
        message: result?.error?.message || 'An error occurred',
        variant: 'error',
      });
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
