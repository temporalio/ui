import type { ActionResult } from '@sveltejs/kit';
import type { Snippet } from 'svelte';
import { superForm, type SuperValidated } from 'sveltekit-superforms';
import { z } from 'zod';

export type MaybePromise<T> = T | Promise<T>;

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

export type FormProps = {
  config: FormConfig;
  children: Snippet;
};

export type OnErrorParams = {
  result: ActionResult & { type: 'error' };
  message?: string;
};

export interface BaseFormConfig {
  schema?: z.ZodType;
  onError?: (event: OnErrorParams) => MaybePromise<void>;
}

export interface SPAFormOptions {
  resetForm?: boolean;
  dataType?: 'json' | 'form';
  invalidateAll?: boolean;
}

export interface ServerFormOptions {
  resetForm?: boolean;
  applyAction?: boolean;
  invalidateAll?: boolean;
}

export interface SPAFormConfig extends BaseFormConfig {
  readonly type: 'spa';
  defaultValues?: Record<string, unknown>;
  onUpdate: (event: OnUpdateParams) => MaybePromise<unknown | void>;
  options?: SPAFormOptions;
}

export interface ServerFormConfig extends BaseFormConfig {
  readonly type: 'server';
  data: SuperValidated<Record<string, unknown>>;
  options?: ServerFormOptions;
}

export type FormConfig = SPAFormConfig | ServerFormConfig;

export interface FormContext {
  form: ReturnType<typeof superForm>;
}

export interface FormContextParams {
  config: FormConfig;
}

export interface FormFieldBinding {
  value: unknown;
  valid: boolean;
  error: boolean;
  hintText: string;
  setValue?: (value: unknown) => void;
}

export interface FormFieldOptions {
  name?: string;
  propValue: unknown;
  propValid: boolean;
  propError: boolean;
  propHintText: string;
  onPropUpdate: (value: unknown) => void;
}

export const formKey = Symbol('form');
