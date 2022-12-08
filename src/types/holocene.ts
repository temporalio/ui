export type HoloceneComponentProps<T extends keyof HTMLElementTagNameMap> =
  svelte.JSX.HTMLProps<HTMLElementTagNameMap[T]> & DataAttributes;

export type DataAttributes = {
  // [index: `data-${string}`]: any;
  'data-cy'?: string;
};
