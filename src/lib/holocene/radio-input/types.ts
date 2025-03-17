import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { Writable } from 'svelte/store';

export interface RadioInputProps<T> extends HTMLInputAttributes {
  value: T;
  id: string;
  label: string;
  labelHidden?: boolean;
  description?: string;
  group?: Writable<T>;
  name?: string;
  'data-testid'?: string;
  class?: string;
}

export interface RadioGroupProps<T> extends HTMLAttributes<HTMLDivElement> {
  name: string;
  group: Writable<T>;
  description?: string;
}

export type RadioGroupContext<T> = {
  name: string;
  group: Writable<T>;
};
