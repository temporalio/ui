import { writable, type Writable } from 'svelte/store';

import { onDestroy } from 'svelte';

import { getFormContext } from './context/form-context';

export interface FormFieldBinding {
  bindableValue: Writable<string>;
  resolvedValid: Writable<boolean>;
  resolvedError: Writable<boolean>;
  resolvedHintText: Writable<string>;
  resolvedConstraints: Writable<Record<string, unknown> | null>;
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

  let formContext = null;
  try {
    formContext = getFormContext();
  } catch (e) {
    formContext = null;
  }

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
  const localValue = writable(value || '');
  return {
    bindableValue: localValue,
    resolvedValid: writable(valid),
    resolvedError: writable(error),
    resolvedHintText: writable(hintText),
    resolvedConstraints: writable(null),
    setValue: (newValue: string) => localValue.set(newValue),
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
  const bindableStore = writable(propValue || '');
  const resolvedValidStore = writable(propValid);
  const resolvedErrorStore = writable(propError);
  const resolvedHintTextStore = writable(propHintText);
  const resolvedConstraintsStore = writable<Record<string, unknown> | null>(
    null,
  );

  // Subscribe to form data changes and update bindable store
  const unsubData = formData.subscribe((val) => {
    const formValue = val?.[name] ?? '';
    bindableStore.set(formValue);
  });

  // Subscribe to bindable store changes and update form data
  const unsubBindable = bindableStore.subscribe((value) => {
    formData.update((d) => ({
      ...(d as Record<string, unknown>),
      [name]: value,
    }));
  });

  // Subscribe to form errors and update reactive stores
  const unsubErrors = formErrors.subscribe((val) => {
    const errorArray = val?.[name];
    const hasError = !!errorArray;
    const hintText = errorArray?.[0] || propHintText;

    resolvedValidStore.set(!hasError);
    resolvedErrorStore.set(hasError);
    resolvedHintTextStore.set(hintText);
  });

  // Subscribe to form constraints
  const unsubConstraints = formConstraints.subscribe((val) => {
    const constraints = val?.[name] || null;
    resolvedConstraintsStore.set(constraints);
  });

  // Cleanup subscriptions
  onDestroy(() => {
    unsubData();
    unsubBindable();
    unsubErrors();
    unsubConstraints();
  });

  return {
    bindableValue: bindableStore,
    resolvedValid: resolvedValidStore,
    resolvedError: resolvedErrorStore,
    resolvedHintText: resolvedHintTextStore,
    resolvedConstraints: resolvedConstraintsStore,
    setValue: (value: string) => {
      bindableStore.set(value);
    },
  };
}
