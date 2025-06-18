import { createServerForm } from './server-form';
import { createSPAForm } from './spa-form';
import type { FormConfig, FormContext } from '../types';

export function createFormContext(config: FormConfig): FormContext {
  switch (config.type) {
    case 'spa':
      return createSPAForm(config);
    case 'server':
      return createServerForm(config);
    default: {
      const _exhaustive: never = config;
      throw new Error('Unknown form type');
    }
  }
}

export { createSPAForm } from './spa-form';
export { createServerForm } from './server-form';
export { formatErrorMessage, defaultErrorHandler } from './base';
