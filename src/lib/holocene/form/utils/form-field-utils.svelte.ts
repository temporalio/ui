import { get, writable } from 'svelte/store';

import { onDestroy } from 'svelte';

import { getFormContext } from '../context/form-context';
import type { FormFieldBinding, FormFieldOptions } from '../types';

export function useFormField(options: FormFieldOptions): FormFieldBinding {
  const { name, propValue, propValid, propError, propHintText, onPropUpdate } =
    options;

  let formContext = null;
  try {
    formContext = getFormContext();
  } catch (e) {
    formContext = null;
  }

  if (formContext && name) {
    console.log(`Using form field binding for name: ${name}`);
    return createFormFieldBinding(
      formContext.form.form,
      formContext.form.errors,
      name,
      propValue,
      propHintText,
    );
  }

  return {
    value: propValue,
    valid: propValid,
    error: propError,
    hintText: propHintText,
    setValue: onPropUpdate,
  };
}

function createFormFieldBinding(
  formData: ReturnType<typeof writable>,
  formErrors: ReturnType<typeof writable>,
  name: string,
  propValue: unknown,
  propHintText: string,
): FormFieldBinding {
  const local = writable<unknown>();
  let currentError: string | undefined;

  const unsubData = formData.subscribe((val) => {
    local.set(val?.[name]);
  });

  const unsubErrors = formErrors.subscribe((val) => {
    currentError = val?.[name];
  });

  onDestroy(() => {
    unsubData();
    unsubErrors();
  });

  return {
    get value() {
      return get(local);
    },
    get valid() {
      return !currentError;
    },
    get error() {
      return !!currentError;
    },
    get hintText() {
      return currentError || propHintText;
    },
    setValue: (value: unknown) => {
      console.log(`Setting value for field "${name}" to`, value);
      formData.update((d) => ({ ...d, [name]: value }));
    },
  };
}
