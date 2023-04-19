export type DataAttributes = {
  // [index: `data-${string}`]: any;
  'data-testid'?: string;
};

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'primary';

export interface Toast {
  message: string;
  variant?: ToastVariant;
  id?: string;
  duration?: number;
}
