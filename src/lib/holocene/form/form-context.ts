import { getContext, setContext } from 'svelte';

export interface FormContextParams {
  formKey: symbol;
  mode?: 'spa' | 'server' | 'hybrid' | 'progressive';
  action?: string;
  method?: 'GET' | 'POST';
  onUpdate?: (data: Record<string, unknown>) => Promise<void> | void;
  onServerSuccess?: (result: Record<string, unknown>) => void;
  onServerError?: (result: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
  schema?: unknown; // Simplified for now
  enableClientValidation?: boolean;
}

export interface FormContext {
  formKey: symbol;
  mode: FormContextParams['mode'];
  data: Record<string, unknown>;
}

export function createFormContext(params: FormContextParams): {
  form: { enhance: () => void };
} {
  const { formKey, mode = 'spa', defaultValues = {} } = params;

  const context: FormContext = {
    formKey,
    mode,
    data: defaultValues,
  };

  // Set context using the symbol key to prevent collisions
  setContext(formKey, context);

  // Return minimal form object for now
  return {
    form: {
      enhance: () => {
        // Placeholder enhance function
      },
    },
  };
}

export function getFormContext(formKey: symbol): FormContext | undefined {
  return getContext(formKey);
}
