<script lang="ts" module>
  import type { Writable } from 'svelte/store';

  export const TABLE_MAXIMIZABLE_CONTEXT = 'table-maximizable';

  export type TableMaximizableContext = {
    maximized: Writable<boolean>;
  };
</script>

<script lang="ts">
  import { writable } from 'svelte/store';

  import { setContext, type Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  const maximized = writable(false);

  setContext<TableMaximizableContext>(TABLE_MAXIMIZABLE_CONTEXT, { maximized });

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !$maximized) return;

    if (event.target instanceof Element && event.target.closest('dialog[open]'))
      return;

    $maximized = false;
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class={$maximized
    ? 'surface-primary fixed inset-0 z-40 flex flex-col'
    : 'contents'}
>
  {@render children()}
</div>
