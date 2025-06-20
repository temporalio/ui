export { default as Form } from './form.svelte';
export { getFormContext } from './form-context';
export { createFormContext } from './factories';
export { useFormField } from './use-form-field.svelte';

export type {
  // Main config types
  FormConfig,
  SPAFormConfig,
  ServerFormConfig,

  // Base types
  BaseFormConfig,
  SPAFormOptions,
  ServerFormOptions,

  // Context types
  FormContext,
  FormContextParams,

  // Field utility types
  FormFieldBinding,
  FormFieldOptions,

  // Event types
  OnUpdateParams,
  OnErrorParams,
  MaybePromise,

  // Component props
  FormProps,
} from './types';

// Re-export factory functions for advanced usage
export {
  createSPAForm,
  createServerForm,
  formatErrorMessage,
  defaultErrorHandler,
} from './factories';
