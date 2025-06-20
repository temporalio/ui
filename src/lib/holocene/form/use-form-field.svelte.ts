import { writable } from 'svelte/store';

import { onDestroy } from 'svelte';

import { getFormContext } from './form-context';

export interface FormFieldBinding {
  bindableValue: string;
  resolvedValid: boolean;
  resolvedError: boolean;
  resolvedHintText: string;
  resolvedConstraints: Record<string, unknown> | null;
  setValue: (value: string) => void;
}

export interface FormFieldOptions {
  name: string;
  value: string;
  valid: boolean;
  error: boolean;
  hintText: string;
}

export function useFormField(options: FormFieldOptions): FormFieldBinding {
  const { name, value, valid, error, hintText } = options;
  const formContext = getFormContext();

  if (formContext && name) {
    return createFormFieldBinding(
      formContext.form.form,
      formContext.form.errors,
      formContext.form.constraints,
      name,
      value,
      valid,
      error,
      hintText,
    );
  }

  // Fallback to props when no form context
  let localValue = $derived(value || '');
  return {
    bindableValue: localValue,
    resolvedValid: valid,
    resolvedError: error,
    resolvedHintText: hintText,
    resolvedConstraints: null,
    setValue: (newValue: string) => (localValue = newValue),
  };
}

function createFormFieldBinding(
  formData: ReturnType<typeof writable>,
  formErrors: ReturnType<typeof writable>,
  formConstraints: ReturnType<typeof writable>,
  name: string,
  propValue: string,
  propValid: boolean,
  propError: boolean,
  propHintText: string,
): FormFieldBinding {
  // Create reactive stores for all resolved values
  let bindableStore = $state(propValue || '');
  let resolvedValidStore = $state(propValid);
  let resolvedErrorStore = $state(propError);
  let resolvedHintTextStore = $state(propHintText);
  let resolvedConstraintsStore = $state<Record<string, unknown> | null>(null);

  // Subscribe to form data changes and update bindable store
  const unsubData = formData.subscribe((val) => {
    const formValue = val?.[name] ?? '';
    bindableStore = formValue;
  });

  // Subscribe to bindable store changes and update form data
  $effect(() => {
    formData.update((d) => ({
      ...(d as Record<string, unknown>),
      [name]: bindableStore,
    }));
  });

  // Subscribe to form errors and update reactive stores
  const unsubErrors = formErrors.subscribe((val) => {
    const errorArray = val?.[name];
    const hasError = !!errorArray;
    const hintText = errorArray?.[0] || propHintText;

    resolvedValidStore = !hasError;
    resolvedErrorStore = hasError;
    resolvedHintTextStore = hintText;
  });

  // Subscribe to form constraints
  const unsubConstraints = formConstraints.subscribe((val) => {
    const constraints = val?.[name] || null;
    resolvedConstraintsStore = constraints;
  });

  // Cleanup subscriptions
  onDestroy(() => {
    unsubData();
    unsubErrors();
    unsubConstraints();
  });

  return {
    get bindableValue() {
      return bindableStore;
    },
    get resolvedValid() {
      return resolvedValidStore;
    },
    get resolvedError() {
      return resolvedErrorStore;
    },
    get resolvedHintText() {
      return resolvedHintTextStore;
    },
    get resolvedConstraints() {
      return resolvedConstraintsStore;
    },
    setValue: (value: string) => {
      bindableStore = value;
    },
  };
}
