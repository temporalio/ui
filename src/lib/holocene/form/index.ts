export { default as FormProvider } from './context/form-provider.svelte';
export { createFormContext, getFormContext } from './context/form-context';
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
} from './types';

// Re-export factory functions for advanced usage
export {
  createSPAForm,
  createServerForm,
  formatErrorMessage,
  defaultErrorHandler,
} from './factories';

export type { FormProps } from './context/form-provider.svelte';

// Legacy export alias
export { default as Form } from './context/form-provider.svelte';
