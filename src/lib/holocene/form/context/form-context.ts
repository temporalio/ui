import { getContext, setContext } from 'svelte';

import { createServerForm, createSPAForm } from '../factories';
import type { FormConfig, FormContext, FormContextParams } from '../types';
import { formKey } from '../types';

export function createFormContext(config: FormConfig): FormContext {
  switch (config.type) {
    case 'spa':
      return createSPAForm(config);
    case 'server':
      return createServerForm(config);
    default: {
      throw new Error('Unknown form type');
    }
  }
}

export function setFormContext(params: FormContextParams): FormContext {
  const context = createFormContext(params.config);
  setContext(formKey, context);
  return context;
}

export function getFormContext(): FormContext | undefined {
  return getContext(formKey);
}
