<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  export type ChipColorScheme =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error';

  export type ChipExtension = {
    text: string;
    Icon?: ConditionalValue<IconComponent>;
  };

  const sharedClasses =
    "relative inline-flex appearance-none items-stretch overflow-hidden whitespace-nowrap rounded-sm border p-0 font-mono text-xs font-medium leading-none uppercase [text-box:trim-both_cap_alphabetic] [&_span]:[text-box:inherit] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-transparent before:content-[''] enabled:cursor-pointer enabled:hover:before:bg-surface-overlay-primary enabled:active:before:bg-surface-overlay-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:cursor-not-allowed disabled:opacity-disabled";
  const segmentClasses =
    'relative z-10 inline-flex flex-nowrap items-center justify-center gap-1 px-1';

  const colorSchemeClasses: Record<
    ChipColorScheme,
    { chip: string; extension: string }
  > = {
    neutral: {
      chip: 'border-secondary bg-surface-neutral text-secondary',
      extension: 'bg-surface-overlay-primary',
    },
    info: {
      chip: 'border-information bg-surface-information text-information',
      extension: 'bg-surface-overlay-information',
    },
    success: {
      chip: 'border-success bg-surface-success text-success',
      extension: 'bg-surface-overlay-success',
    },
    warning: {
      chip: 'border-warning bg-surface-warning text-warning',
      extension: 'bg-surface-overlay-warning',
    },
    danger: {
      chip: 'border-danger bg-surface-danger text-danger',
      extension: 'bg-surface-overlay-danger',
    },
    error: {
      chip: 'border-error bg-surface-error text-error',
      extension: 'bg-surface-overlay-error',
    },
  };
</script>

<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  interface Props extends Omit<
    HTMLButtonAttributes,
    'children' | 'class' | 'type'
  > {
    text: string;
    colorScheme?: ChipColorScheme;
    Icon?: ConditionalValue<IconComponent>;
    extension?: ConditionalValue<ChipExtension>;
    class?: string;
    type?: HTMLButtonAttributes['type'];
  }

  let {
    text,
    colorScheme = 'neutral',
    Icon,
    extension,
    class: className,
    type = 'button',
    ...rest
  }: Props = $props();
</script>

<button
  {type}
  class={twMerge(
    sharedClasses,
    colorSchemeClasses[colorScheme].chip,
    className,
  )}
  {...rest}
>
  <span class="{segmentClasses} py-0.5">
    {#if Icon}
      <Icon width="1em" height="1em" />
    {/if}
    <span>{text}</span>
  </span>
  {#if extension}
    <span
      class={twMerge(segmentClasses, colorSchemeClasses[colorScheme].extension)}
    >
      {#if extension.Icon}
        <extension.Icon width="1em" height="1em" />
      {/if}
      <span>{extension.text}</span>
    </span>
  {/if}
</button>
