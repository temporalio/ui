import type { SvelteComponent } from 'svelte';

export type TableColumn = {
  key: string;
  label: string | HTMLElement;
  classes?: string;
  type?: 'dateTime' | 'link';
  cellClasses?: string;
  component?: typeof SvelteComponent;
  props?: string[];
  filter?: typeof SvelteComponent;
};
