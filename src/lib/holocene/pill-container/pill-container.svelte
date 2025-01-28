<script lang="ts" module>
  export type PillsContext = {
    activePill: Writable<string>;
    registerPill: (pill: string) => void;
    selectPill: (pill: string) => void;
  };

  export const PILLS = {};
</script>

<script lang="ts">
  import { type Writable, writable } from 'svelte/store';

  import { onDestroy, setContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className = '', children }: Props = $props();

  const pills: string[] = $state([]);
  const activePill = writable<string>(null);

  setContext<PillsContext>(PILLS, {
    registerPill: (pill: string) => {
      pills.push(pill);
      activePill.update((current) => current || pill);

      onDestroy(() => {
        const i = pills.indexOf(pill);
        pills.splice(i, 1);
        activePill.update((current) =>
          current === pill ? pills[i] || pills[pills.length - 1] : current,
        );
      });
    },
    selectPill: (pill: string) => {
      activePill.set(pill);
    },
    activePill,
  });
</script>

<div
  class={merge(
    'surface-subtle inline-flex flex-col items-center justify-start gap-2 rounded-md px-2 py-2 md:flex-row md:rounded-full',
    className,
  )}
>
  {@render children?.()}
</div>
