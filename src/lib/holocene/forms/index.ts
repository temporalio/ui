import type { validators } from 'svelte-use-form';

export type FormField = {
  key: string;
  label: string;
  required: boolean;
  validations?: typeof validators[];
  hint?: string;
  placeholder?: string;
};

export function setBodyProperty(path: string, body: unknown, value: unknown) {
  const properties = path.split('.');
  return properties.reduce(
    (o, p, index) =>
      (o[p] = properties?.length === ++index ? value : o[p] || {}),
    body,
  );
}
