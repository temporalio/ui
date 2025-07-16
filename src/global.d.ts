/// <reference types="@sveltejs/kit" />

declare namespace svelte.JSX {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    'onclick-outside': (e: CustomEvent) => void;
  }
}
