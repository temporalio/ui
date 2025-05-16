<script lang="ts" module>
  export type PillsContext = {
    activePill: Writable<string>;
    registerPill: (pill: string, disabled?: boolean) => void;
    selectPill: (pill: string) => void;
  };

  export const PILLS = {};
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { type Writable, writable } from 'svelte/store';

  import type { Snippet } from 'svelte';
  import { onDestroy, setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  type Props = HTMLAttributes<HTMLDivElement> & {
    class?: string;
    children?: Snippet;
  };

  let { class: className = '', children }: Props = $props();

  const pills: { id: string; disabled: boolean }[] = [];
  const activePill = writable<string>(null);

  setContext<PillsContext>(PILLS, {
    registerPill: (pill: string, disabled = false) => {
      pills.push({ id: pill, disabled });

      if (!disabled) {
        activePill.update((current) => current || pill);
      }

      onDestroy(() => {
        const i = pills.findIndex((p) => p.id === pill);
        pills.splice(i, 1);

        activePill.update((current) =>
          current === pill
            ? (pills.find((p) => p.id !== pill && !p.disabled)?.id ?? null)
            : current,
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
