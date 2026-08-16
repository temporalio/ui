<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import CommandRail from '$lib/holocene/command-rail.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    label: string;
    class?: string;
    containerClass?: string;
    commandRail?: boolean;
    children: Snippet;
  }

  let {
    label,
    class: className = '',
    containerClass = '',
    commandRail = false,
    children,
    onkeydown,
    ...restProps
  }: Props = $props();

  const handleKeydown = (
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement },
  ) => {
    onkeydown?.(event);
    if (event.defaultPrevented) return;

    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      target.getAttribute('role') !== 'tab'
    )
      return;

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"]):not([disabled])',
      ),
    );
    const currentIndex = tabs.indexOf(target);
    if (currentIndex < 0) return;

    const direction = getComputedStyle(event.currentTarget).direction;
    const previousKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    let nextIndex: number | undefined;

    if (event.key === previousKey) {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === nextKey) {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    tabs[nextIndex]?.focus();
  };
</script>

{#if commandRail}
  <CommandRail
    {label}
    role="tablist"
    aria-label={label}
    class={merge('border-b border-subtle', containerClass)}
    viewportClass={merge(
      'flex h-full flex-nowrap items-center gap-x-4 overflow-y-hidden',
      className,
    )}
    onkeydown={handleKeydown}
    {...restProps}
  >
    {@render children()}
  </CommandRail>
{:else}
  <div
    class={merge(
      'flex flex-nowrap gap-x-4 overflow-x-auto border-b border-subtle [scrollbar-width:thin]',
      containerClass,
      className,
    )}
    role="tablist"
    aria-label={label}
    onkeydown={handleKeydown}
    {...restProps}
  >
    {@render children()}
  </div>
{/if}
