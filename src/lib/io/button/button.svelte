<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twJoin, twMerge } from 'tailwind-merge';

  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  export type ButtonColorScheme =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'ghost'
    | 'danger';
  export type ButtonSize = 'xs' | 'sm' | 'md';

  const disabledClasses = twJoin(
    'disabled:cursor-not-allowed',
    'disabled:opacity-disabled',
  );

  const iconOnlyClasses = twJoin(
    '[&:has(>svg:only-child)]:aspect-square',
    '[&:has(>svg:only-child)]:p-0',
  );

  const sharedClasses = twJoin(
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
      'enabled:hover:bg-interactive-primary-hover',
      'enabled:active:bg-interactive-primary-press',
      'enabled:focus-visible:bg-interactive-primary-hover',
    ),
    secondary: twJoin(
      'border-brand bg-interactive-secondary text-brand',
      'enabled:hover:bg-interactive-secondary-hover',
      'enabled:active:bg-interactive-secondary-press',
      'enabled:focus-visible:bg-interactive-secondary-hover',
    ),
    tertiary: twJoin(
      'border-secondary bg-interactive-tertiary text-primary',
      'enabled:hover:bg-interactive-tertiary-hover',
      'enabled:active:bg-interactive-tertiary-press',
      'enabled:focus-visible:bg-interactive-tertiary-hover',
    ),
    ghost: twJoin(
      'bg-interactive-tertiary text-primary',
      'enabled:hover:bg-interactive-tertiary-hover',
      'enabled:active:bg-interactive-tertiary-press',
      'enabled:focus-visible:bg-interactive-tertiary-hover',
    ),
    danger: twJoin(
      'bg-interactive-danger text-primary',
      'enabled:hover:bg-interactive-danger-hover',
      'enabled:active:bg-interactive-danger-press',
      'enabled:focus-visible:bg-interactive-danger-hover',
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
      sharedClasses,
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
    class?: string;
  }
</script>

<script lang="ts">
  let {
    class: className,
    colorScheme = 'primary',
    size = 'md',
    type = 'button',
    children,
    LeadingIcon,
    TrailingIcon,
    ...rest
  }: ButtonProps = $props();

  const iconSize = $derived(size === 'md' ? 16 : 12);
</script>

<button {...rest} {type} class={buttonRecipe({ colorScheme, size, className })}>
  {#if LeadingIcon}
    <LeadingIcon width={iconSize} height={iconSize} />
  {/if}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {#if TrailingIcon}
    <TrailingIcon width={iconSize} height={iconSize} />
  {/if}
</button>
