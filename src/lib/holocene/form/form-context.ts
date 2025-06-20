import { getContext, setContext } from 'svelte';

import { createFormContext } from './factories';
import type { FormContext, FormContextParams } from './types';
import { formKey } from './types';

export function setFormContext(params: FormContextParams): FormContext {
  const context = createFormContext(params.config);
  setContext(formKey, context);
  return context;
}

export function getFormContext(): FormContext | undefined {
  return getContext(formKey);
}
