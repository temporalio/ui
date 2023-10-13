/// <reference types="@sveltejs/kit" />

declare module '@crownframework/svelte-error-boundary';
declare module '@sveltejs/svelte-virtual-list';

declare namespace svelte.JSX {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    'onclick-outside': () => void;
  }
}
