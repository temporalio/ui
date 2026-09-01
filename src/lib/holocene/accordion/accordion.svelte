<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import {
    IconChevronDown,
    IconChevronUp,
    type IconComponent,
  } from '$lib/io/icon';

  interface Props extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'title' | 'children'
  > {
    title: string;
    id?: string;
    subtitle?: string;
    Icon?: IconComponent;
    open?: boolean;
    expandable?: boolean;
    disabled?: boolean;
    error?: string;
    onToggle?: () => void;
    'data-testid'?: string;
    class?: string;
    summary?: Snippet;
    action?: Snippet;
    children?: Snippet<[boolean]>;
  }

  const generatedId = $props.id();

  let {
    title,
    id = generatedId,
    subtitle = '',
    Icon,
    open = $bindable(false),
    expandable = true,
    disabled = false,
    error = '',
    onToggle,
    class: className = '',
    summary,
    action,
    children,
    ...rest
  }: Props = $props();

  const toggleAccordion = () => {
    open = !open;
    onToggle?.();
  };

  const Glyph = $derived(open ? IconChevronUp : IconChevronDown);
</script>

{#if expandable}
  <div
    data-track-container={title}
    class={merge(
      'w-full border border-primary bg-surface-primary text-primary',
      className,
    )}
    {...rest}
  >
    <div class="flex w-full flex-row items-center">
      <button
        id="{id}-trigger"
        aria-expanded={open}
        aria-controls="{id}-content"
        class="flex grow flex-col p-4 hover:bg-interactive-secondary-hover focus-visible:bg-surface-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:cursor-not-allowed disabled:opacity-disabled disabled:hover:bg-transparent"
        type="button"
        {disabled}
        data-track-name="accordion"
        data-track-intent="toggle"
        data-track-text={title}
        onclick={toggleAccordion}
      >
        <div class="flex w-full flex-row items-center justify-between gap-2">
          <div class="flex w-full items-center gap-2">
            <h3 class="flex shrink-0 items-center gap-2">
              {#if Icon}<Icon />{/if}
              {title}
            </h3>
            <div class="text-secondary max-sm:hidden">
              {@render summary?.()}
            </div>
          </div>
          <Glyph class="shrink-0" />
        </div>
        <div class="text-secondary sm:hidden">
          {@render summary?.()}
        </div>
        <p class="flex items-center">
          {#if error}
            <Badge class="mr-2" type="danger">{error}</Badge>
          {/if}
          <span class="text-secondary">{subtitle}</span>
        </p>
      </button>
      {#if action}
        <div class="flex shrink-0 flex-row items-center gap-2 pr-2">
          {@render action()}
        </div>
      {/if}
    </div>

    <div
      id="{id}-content"
      aria-labelledby="{id}-trigger"
      class="mt-4 block w-full p-4"
      class:hidden={!open}
    >
      {@render children?.(open)}
    </div>
  </div>
{:else}
  <div
    class={merge(
      'w-full border border-primary bg-surface-primary p-4 text-primary',
      className,
    )}
    data-track-container={title}
    {...rest}
  >
    <div class="flex w-full flex-col">
      <div class="flex w-full flex-row items-center justify-between gap-2">
        <div class="flex w-full items-center gap-2">
          <h3 class="flex shrink-0 items-center gap-2">
            {#if Icon}<Icon />{/if}
            {title}
          </h3>
          <div class="text-secondary max-sm:hidden">
            {@render summary?.()}
          </div>
        </div>
        <div class="flex flex-row items-center gap-2 pr-2">
          {@render action?.()}
        </div>
      </div>
      <div class="text-secondary sm:hidden">
        {@render summary?.()}
      </div>
      <p class="flex items-center">
        {#if error}
          <Badge class="mr-2" type="danger">{error}</Badge>
        {/if}
        <span class="text-secondary">{subtitle}</span>
      </p>
    </div>

    <div class="mt-6 block w-full" class:hidden={!open}>
      {@render children?.(open)}
    </div>
  </div>
{/if}
