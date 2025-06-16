<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import MaximizeButton from './button.svelte';

  interface Props {
    children: Snippet;
    maximized: boolean;
    onMaximize: (maximized: boolean) => void;
    class?: string;
    enabled?: boolean;
    actions?: Snippet;
  }

  let {
    children,
    maximized,
    onMaximize,
    class: className = undefined,
    enabled = true,
    actions = undefined,
  }: Props = $props();

  let escapeListener = $state((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onMaximize(false);
    }
  });

  $effect(() => {
    if (maximized) {
      document.addEventListener('keydown', escapeListener);
    } else {
      document.removeEventListener('keydown', escapeListener);
    }
  });

  onMount(() => {
    // on unmount
    return () => {
      document.removeEventListener('keydown', escapeListener);
    };
  });

  const handleClick = () => {
    onMaximize(!maximized);
  };
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
        onClick={handleClick}
        {maximized}
      />
    {/if}
  </div>
</div>
