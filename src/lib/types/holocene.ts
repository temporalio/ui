export type DataAttributes = {
  // [index: `data-${string}`]: any;
  'data-testid'?: string;
};

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'primary';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Toast {
  message: string;
  variant?: ToastVariant;
  id?: string;
  duration?: number;
  link?: string;
}
