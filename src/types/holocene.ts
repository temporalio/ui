export type HoloceneComponentProps<T extends keyof HTMLElementTagNameMap> =
  svelte.JSX.HTMLProps<HTMLElementTagNameMap[T]> & DataAttributes;

export type DataAttributes = {
  // [index: `data-${string}`]: any;
  'data-cy'?: string;
};

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'primary';

export interface Toast {
  message: string;
  variant?: ToastVariant;
  id?: string;
  duration?: number;
}
