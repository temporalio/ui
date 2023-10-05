import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { Writable } from 'svelte/store';

export interface RadioInputProps<T> extends HTMLInputAttributes {
  value: T;
  id: string;
  label: string;
  labelHidden?: boolean;
  group?: Writable<T>;
  name?: string;
}

export interface RadioGroupProps<T> extends HTMLAttributes<HTMLDivElement> {
  name: string;
  group: Writable<T>;
}

export type RadioGroupContext<T> = {
  name: string;
  group: Writable<T>;
};
