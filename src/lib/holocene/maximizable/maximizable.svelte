<script lang="ts">
  import { type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import MaximizeButton from './button.svelte';

  interface Props {
    children: Snippet;
    maximized: boolean;
    class?: string;
    enabled?: boolean;
    actions?: Snippet;
  }

  let {
    children,
    maximized = $bindable(false),
    class: className = undefined,
    enabled = true,
    actions = undefined,
  }: Props = $props();

  let escapeListener = (event: KeyboardEvent) => {
    if (maximized && event.key === 'Escape') {
      maximized = false;
    }
  };

  const handleClick = () => {
    maximized = !maximized;
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (
      maximized &&
      (!(event.currentTarget instanceof Element) ||
        !(event.relatedTarget instanceof Element) ||
        !event.currentTarget.contains(event.relatedTarget))
    ) {
      maximized = false;
    }
  };
</script>

<svelte:window onkeydown={escapeListener} />

<div
  class={merge(
    'relative',
    maximized
      ? 'fixed bottom-0 left-0 right-0 top-0 z-100 h-full w-full overflow-y-auto bg-white dark:bg-black'
      : '',
    className,
  )}
  onfocusout={handleFocusOut}
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
