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
  mode: 'spa';
  formKey: symbol;
  schema?: z.ZodObject<z.ZodRawShape>;
  defaultValues?: Record<string, unknown>;
  onUpdate: (event: OnUpdateParams) => MaybePromise<unknown | void> | undefined;
}

export interface BaseServerFormParams {
  mode: 'server';
  formKey: symbol;
  schema?: z.ZodObject<z.ZodRawShape>;
  action?: string;
  method?: 'GET' | 'POST';
  data: SuperValidated<Record<string, unknown>>;
}

export type FormContextParams = BaseSPAFormParams | BaseServerFormParams;

export interface FormContext {
  formKey: symbol;
  mode: FormContextParams['mode'];
  form: ReturnType<typeof superForm>;
}

export function createFormContext(params: FormContextParams): FormContext {
  const { formKey, mode, schema } = params;

  let f: ReturnType<typeof superForm>;

  if (mode === 'spa') {
    const { defaultValues = {}, onUpdate } = params;

    f = superForm(defaultValues, {
      resetForm: false,
      dataType: 'json',
      SPA: true,
      validators: schema ? zodClient(schema) : undefined,
      onUpdate: async (event: OnUpdateParams) => {
        const result = await onUpdate(event);
        return result;
      },
      onError: ({ result }) => {
        toaster.push({
          message: result?.error?.message || 'An error occurred',
          variant: 'error',
        });
      },
    });
  } else {
    // Server mode
    const { data } = params;

    f = superForm(data, {
      resetForm: false,
      dataType: 'json',
      validators: schema ? zodClient(schema) : undefined,
      onError: ({ result }) => {
        toaster.push({
          message: result?.error?.message || 'An error occurred',
          variant: 'error',
        });
      },
    });
  }

  const context: FormContext = {
    formKey,
    mode,
    form: f,
  };

  setContext(formKey, context);

  return context;
}

export function getFormContext(formKey: symbol): FormContext | undefined {
  return getContext(formKey);
}
