<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twJoin, twMerge } from 'tailwind-merge';

  import { type IconComponent, IconSpinner } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  import type { TrackingOptions } from './tracking';

  export type ButtonColorScheme =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'ghost'
    | 'danger';
  export type ButtonSize = 'xs' | 'sm' | 'md';

  const disabledClasses = twJoin(
    'disabled:cursor-not-allowed',
    'disabled:[&:not([aria-busy=true])]:opacity-disabled',
  );

  const iconOnlyClasses = twJoin(
    '[&:has(>svg:only-child)]:aspect-square',
    '[&:has(>svg:only-child)]:p-0',
  );

  const wrapperClasses = twJoin(
    'relative',
    'inline-flex',
    'shrink-0',
    'font-sans',
    'font-medium',
    'items-center',
    'justify-center',
    'whitespace-nowrap',
    'rounded',
    'border',
    'border-transparent',
    'cursor-pointer',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-interactive-primary-press',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background-primary',
  );

  const colorSchemeClasses: Record<ButtonColorScheme, string> = {
    primary: twJoin(
      'text-white bg-interactive-primary',
      '[&:not(:disabled)]:hover:bg-interactive-primary-hover',
      '[&:not(:disabled)[data-state=hover]]:bg-interactive-primary-hover',
      '[&:not(:disabled)]:active:bg-interactive-primary-press',
      '[&:not(:disabled)[data-state=active]]:bg-interactive-primary-press',
      '[&:not(:disabled)]:focus-visible:bg-interactive-primary-hover',
    ),
    secondary: twJoin(
      'border-brand bg-interactive-secondary text-brand',
      '[&:not(:disabled)]:hover:bg-interactive-secondary-hover',
      '[&:not(:disabled)[data-state=hover]]:bg-interactive-secondary-hover',
      '[&:not(:disabled)]:active:bg-interactive-secondary-press',
      '[&:not(:disabled)[data-state=active]]:bg-interactive-secondary-press',
      '[&:not(:disabled)]:focus-visible:bg-interactive-secondary-hover',
    ),
    tertiary: twJoin(
      'border-secondary bg-interactive-tertiary text-primary',
      '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover',
      '[&:not(:disabled)[data-state=hover]]:bg-interactive-tertiary-hover',
      '[&:not(:disabled)]:active:bg-interactive-tertiary-press',
      '[&:not(:disabled)[data-state=active]]:bg-interactive-tertiary-press',
      '[&:not(:disabled)]:focus-visible:bg-interactive-tertiary-hover',
    ),
    ghost: twJoin(
      'bg-interactive-tertiary text-primary',
      '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover',
      '[&:not(:disabled)[data-state=hover]]:bg-interactive-tertiary-hover',
      '[&:not(:disabled)]:active:bg-interactive-tertiary-press',
      '[&:not(:disabled)[data-state=active]]:bg-interactive-tertiary-press',
      '[&:not(:disabled)]:focus-visible:bg-interactive-tertiary-hover',
    ),
    danger: twJoin(
      'bg-interactive-danger text-white',
      '[&:not(:disabled)]:hover:bg-interactive-danger-hover',
      '[&:not(:disabled)[data-state=hover]]:bg-interactive-danger-hover',
      '[&:not(:disabled)]:active:bg-interactive-danger-press',
      '[&:not(:disabled)[data-state=active]]:bg-interactive-danger-press',
      '[&:not(:disabled)]:focus-visible:bg-interactive-danger-hover',
    ),
  };

  const sizeClasses: Record<ButtonSize, string> = {
    xs: twJoin('min-h-5 py-0.5 px-2 gap-1 text-xs leading-none'),
    sm: twJoin('min-h-6 py-1 px-2 gap-1 text-xs leading-none'),
    md: twJoin('min-h-8 py-1 px-3 gap-2 text-base leading-none'),
  };

  export const buttonRecipe = ({
    colorScheme,
    size,
    className,
  }: {
    colorScheme: ButtonColorScheme;
    size: ButtonSize;
    className?: string;
  }) => {
    return twMerge(
      wrapperClasses,
      colorSchemeClasses[colorScheme],
      sizeClasses[size],
      iconOnlyClasses,
      className,
      disabledClasses,
    );
  };

  export interface ButtonProps extends Omit<HTMLButtonAttributes, 'class'> {
    colorScheme?: ButtonColorScheme;
    size?: ButtonSize;
    LeadingIcon?: ConditionalValue<IconComponent>;
    TrailingIcon?: ConditionalValue<IconComponent>;
    isLoading?: boolean;
    tracking?: TrackingOptions;
    class?: string;
  }
</script>

<script lang="ts">
  import { getTrackingAttributes } from './tracking';

  let {
    class: className,
    colorScheme = 'primary',
    size = 'md',
    type = 'button',
    children,
    isLoading,
    tracking,
    LeadingIcon,
    TrailingIcon,
    ...rest
  }: ButtonProps = $props();

  const iconSize = $derived(size === 'md' ? 16 : 12);
</script>

{#snippet loadingIcon()}
  <IconSpinner class="animate-spin" width={iconSize} height={iconSize} />
{/snippet}

{#snippet leadingIcon()}
  {#if LeadingIcon}
    {#if isLoading}
      {@render loadingIcon()}
    {:else}
      <LeadingIcon width={iconSize} height={iconSize} />
    {/if}
  {/if}
{/snippet}

{#snippet trailingIcon()}
  {#if TrailingIcon && (LeadingIcon || !isLoading)}
    <TrailingIcon width={iconSize} height={iconSize} />
  {:else if !LeadingIcon && isLoading}
    {@render loadingIcon()}
  {/if}
{/snippet}

<button
  aria-busy={isLoading}
  {...getTrackingAttributes(tracking, colorScheme)}
  {...rest}
  {type}
  class={buttonRecipe({ colorScheme, size, className })}
>
  {@render leadingIcon()}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {@render trailingIcon()}
</button>
