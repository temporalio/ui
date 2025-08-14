<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';
  import { v4 } from 'uuid';

  import Badge from '$lib/anthropocene/badge.svelte';
  import type { IconName } from '$lib/anthropocene/icon';
  import Icon from '$lib/anthropocene/icon/icon.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    id?: string;
    subtitle?: string;
    icon?: IconName;
    open?: boolean;
    expandable?: boolean;
    error?: string;
    onToggle?: () => void;
    'data-testid'?: string;
    class?: string;
    children?: Snippet<[{ open: boolean }]>;
    summary?: Snippet;
    action?: Snippet;
  }

  let {
    title,
    id = v4(),
    subtitle = '',
    icon = null,
    open = $bindable(false),
    expandable = true,
    error = '',
    onToggle = () => {},
    class: className = '',
    children,
    summary,
    action,
    ...restProps
  }: Props = $props();

  const toggleAccordion = () => {
    open = !open;
    onToggle();
  };
</script>

{#if expandable}
  <div
    class={merge('surface-primary w-full border border-subtle', className)}
    {...restProps}
  >
    <button
      id="{id}-trigger"
      aria-expanded={open}
      aria-controls="{id}-content"
      class="flex w-full flex-col p-4 focus-visible:bg-interactive-secondary-hover focus-visible:outline-none"
      type="button"
      onclick={toggleAccordion}
    >
      <div class="flex w-full flex-row items-center justify-between gap-2">
        <div class="flex w-full items-center gap-2">
          <h3 class="flex shrink-0 items-center gap-2">
            {#if icon}<Icon name={icon} />{/if}
            {title}
          </h3>
          <div class="text-secondary max-sm:hidden">
            {#if summary}{@render summary()}{/if}
          </div>
        </div>
        <div
          class="flex flex-row items-center gap-2 pr-2"
          onclick={(e) => e.stopPropagation()}
          onkeyup={(e) => e.stopPropagation()}
          role="none"
        >
          {#if action}{@render action()}{/if}
        </div>
        <Icon class="shrink-0" name={open ? 'chevron-up' : 'chevron-down'} />
      </div>
      <div class="text-secondary sm:hidden">
        <slot name="summary" />
      </div>
      <p class="flex items-center">
        {#if error}
          <Badge class="mr-2" type="danger">{error}</Badge>
        {/if}
        <span class="text-secondary">{subtitle}</span>
      </p>
    </button>

    <div
      id="{id}-content"
      aria-labelledby="{id}-trigger"
      role="textbox"
      class="mt-4 block w-full p-4"
      class:hidden={!open}
    >
      {#if children}{@render children({ open })}{/if}
    </div>
  </div>
{:else}
  <div class="surface-primary w-full border border-subtle p-4" {...$$restProps}>
    <div class="flex w-full flex-col">
      <div class="flex w-full flex-row items-center justify-between gap-2">
        <div class="flex w-full items-center gap-2">
          <h3 class="flex shrink-0 items-center gap-2">
            {#if icon}<Icon name={icon} />{/if}
            {title}
          </h3>
          <div class="text-secondary max-sm:hidden">
            {#if summary}{@render summary()}{/if}
          </div>
        </div>
        <div class="flex flex-row items-center gap-2 pr-2">
          {#if action}{@render action()}{/if}
        </div>
      </div>
      <div class="text-secondary sm:hidden">
        <slot name="summary" />
      </div>
      <p class="flex items-center">
        {#if error}
          <Badge class="mr-2" type="danger">{error}</Badge>
        {/if}
        <span class="text-secondary">{subtitle}</span>
      </p>
    </div>

    <div class="mt-6 block w-full" class:hidden={!open}>
      {#if children}{@render children({ open })}{/if}
    </div>
  </div>
{/if}
