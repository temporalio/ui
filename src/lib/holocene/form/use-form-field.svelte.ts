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
      hintText,
    );
  }

  // Fallback to props when no form context - use $state outside component
  let bindableValue = $state(value || '');

  return {
    get bindableValue() {
      return bindableValue;
    },
    set bindableValue(newValue: string) {
      bindableValue = newValue;
    },
    resolvedValid: valid,
    resolvedError: error,
    resolvedHintText: hintText,
    resolvedConstraints: null,
    setValue: (newValue: string) => {
      bindableValue = newValue;
    },
  };
}

function createFormFieldBinding(
  formData: ReturnType<typeof writable>,
  formErrors: ReturnType<typeof writable>,
  formConstraints: ReturnType<typeof writable>,
  name: string,
  propValue: string,
  propHintText: string,
): FormFieldBinding {
  // Use $state and $derived for reactive values
  let bindableValue = $state(propValue || '');
  let formErrorsSnapshot = $state({});
  let formConstraintsSnapshot = $state({});

  // Derived values based on current form state
  const resolvedValid = $derived(() => {
    const errorArray = formErrorsSnapshot?.[name];
    return !errorArray;
  });

  const resolvedError = $derived(() => {
    const errorArray = formErrorsSnapshot?.[name];
    return !!errorArray;
  });

  const resolvedHintText = $derived(() => {
    const errorArray = formErrorsSnapshot?.[name];
    return errorArray?.[0] || propHintText;
  });

  const resolvedConstraints = $derived(() => {
    return formConstraintsSnapshot?.[name] || null;
  });

  // Subscribe to form data changes and sync with $state
  const unsubData = formData.subscribe((val) => {
    const formValue = val?.[name] ?? '';
    if (bindableValue !== formValue) {
      bindableValue = formValue;
    }
  });

  // Update form data when bindable value changes using $effect
  $effect(() => {
    formData.update((d) => ({
      ...(d as Record<string, unknown>),
      [name]: bindableValue,
    }));
  });

  // Subscribe to form errors and update $state
  const unsubErrors = formErrors.subscribe((val) => {
    formErrorsSnapshot = val;
  });

  // Subscribe to form constraints and update $state
  const unsubConstraints = formConstraints.subscribe((val) => {
    formConstraintsSnapshot = val;
  });

  // Cleanup subscriptions
  onDestroy(() => {
    unsubData();
    unsubErrors();
    unsubConstraints();
  });

  return {
    get bindableValue() {
      return bindableValue;
    },
    set bindableValue(value: string) {
      bindableValue = value;
    },
    get resolvedValid() {
      return resolvedValid();
    },
    get resolvedError() {
      return resolvedError();
    },
    get resolvedHintText() {
      return resolvedHintText();
    },
    get resolvedConstraints() {
      return resolvedConstraints();
    },
    setValue: (value: string) => {
      bindableValue = value;
    },
  };
}
