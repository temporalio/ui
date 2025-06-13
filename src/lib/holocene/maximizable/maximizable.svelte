<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import MaximizeButton from './button.svelte';

  interface Props {
    children: Snippet;
    maximized: boolean;
    onToggleMaximize: () => void;
    class?: string;
    enabled?: boolean;
    actions?: Snippet;
  }

  let {
    children,
    maximized,
    onToggleMaximize,
    class: className = undefined,
    enabled = true,
    actions = undefined,
  }: Props = $props();
</script>

<div
  class={merge(
    'relative',
    maximized
      ? 'fixed bottom-0 left-0 right-0 top-0 z-10 h-full w-full overflow-y-auto bg-white dark:bg-black'
      : '',
    className,
  )}
>
  {@render children()}

  <div
    class={merge(
      maximized ? 'fixed' : 'absolute',
      'right-2 top-2 flex items-center',
    )}
  >
    {@render actions?.()}
    {#if enabled}
      <MaximizeButton
        class="m-0 rounded-full text-secondary"
        onClick={onToggleMaximize}
        {maximized}
      />
    {/if}
  </div>
</div>
