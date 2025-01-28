<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '../icon/icon.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    label: string;
    open?: boolean;
    class?: string;
  }

  let {
    class: className = '',
    label,
    open = false,
    children,
    ...rest
  }: Props = $props();

  const toggleOpen = () => (open = !open);
</script>

<div
  class={merge(
    'flex w-full flex-row items-center justify-evenly gap-4',
    className,
  )}
  {...rest}
>
  <div class="w-full border border-subtle"></div>
  <button
    class="flex grow items-center gap-2 whitespace-nowrap"
    onclick={toggleOpen}
  >
    {label}
    <Icon name={open ? 'chevron-up' : 'chevron-down'} />
  </button>
  <div class="w-full border border-subtle"></div>
</div>

<div class:hidden={!open}>
  {@render children?.()}
</div>
