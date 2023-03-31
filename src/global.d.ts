/// <reference types="@sveltejs/kit" />

declare module '@crownframework/svelte-error-boundary';
declare module '@sveltejs/svelte-virtual-list';

interface Window {
  Prism: {
    highlightAll: () => void;
    highlightElement: (element: Element) => void;
  };
}
