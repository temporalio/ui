import { get } from 'svelte/store';

import { getFormContext } from './form-context';

export interface FormFieldBinding {
  value: unknown;
  valid: boolean;
  error: boolean;
  hintText: string;
  setValue: (value: unknown) => void;
}

export interface FormFieldOptions {
  name?: string;
  propValue: unknown;
  propValid: boolean;
  propError: boolean;
  propHintText: string;
  onPropUpdate: (value: unknown) => void;
}

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
    const formData = formContext.form.form;
    const formErrors = formContext.form.errors;

    const currentData = get(formData);
    const currentErrors = get(formErrors);

    return {
      value: currentData[name] ?? propValue,
      valid: !currentErrors[name] && propValid,
      error: !!currentErrors[name] || propError,
      hintText: currentErrors[name] ? currentErrors[name][0] : propHintText,
      setValue: (value: unknown) => {
        formData.update((data: object) => ({ ...data, [name]: value }));
      },
    };
  }

  return {
    value: propValue,
    valid: propValid,
    error: propError,
    hintText: propHintText,
    setValue: onPropUpdate,
  };
}
