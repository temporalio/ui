<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  export type TagColorScheme =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'accent';

  export type TagExtension = {
    text: string;
    Icon?: ConditionalValue<IconComponent>;
  };

  const sharedClasses =
    'inline-flex whitespace-nowrap divide-x divide-inherit rounded-full border font-mono text-xs font-medium leading-none uppercase px-0.5';
  const segmentClasses =
    'inline-flex flex-nowrap items-center justify-center gap-1 p-1';

  const colorSchemeClasses: Record<TagColorScheme, string> = {
    neutral: 'border-primary bg-surface-primary text-secondary',
    info: 'border-information bg-surface-information text-information',
    success: 'border-success bg-surface-success text-success',
    warning: 'border-warning bg-surface-warning text-warning',
    danger: 'border-danger bg-surface-danger text-danger',
    accent: 'border-accent bg-surface-accent text-accent',
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  import { IconTag } from '$lib/io/icon';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    text: string;
    colorScheme?: TagColorScheme;
    Icon?: ConditionalValue<IconComponent>;
    extension?: ConditionalValue<TagExtension>;
    class?: string;
  }

  let {
    text,
    colorScheme = 'neutral',
    Icon = IconTag,
    extension,
    class: className,
    ...rest
  }: Props = $props();
</script>

<span
  class={twMerge(sharedClasses, colorSchemeClasses[colorScheme], className)}
  {...rest}
>
  <span class={segmentClasses}>
    {#if Icon}
      <Icon width="1em" height="1em" />
    {/if}
    <span>{text}</span>
  </span>
  {#if extension}
    <span class={segmentClasses}>
      {#if extension.Icon}
        <extension.Icon width="1em" height="1em" />
      {/if}
      <span>{extension.text}</span>
    </span>
  {/if}
</span>
