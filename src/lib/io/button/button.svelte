<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { IconComponent } from '$lib/io/icon/types';
  import type { ConditionalValue } from '$lib/io/types';

  export type ButtonColorScheme =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'ghost'
    | 'danger';
  export type ButtonSize = 'xs' | 'sm' | 'md';
  export type ButtonVariant = 'default' | 'icon';

  type SharedProps = Omit<HTMLButtonAttributes, 'children' | 'class'> & {
    colorScheme?: ButtonColorScheme;
    size?: ButtonSize;
    class?: string;
  };

  export type ButtonProps = SharedProps &
    (
      | {
          variant?: 'default';
          children: Snippet;
          LeadingIcon?: ConditionalValue<IconComponent>;
          TrailingIcon?: ConditionalValue<IconComponent>;
          trailingElement?: Snippet;
          Icon?: never;
        }
      | {
          variant: 'icon';
          Icon: IconComponent;
          'aria-label': string;
          children?: never;
          LeadingIcon?: never;
          TrailingIcon?: never;
          trailingElement?: never;
        }
    );

  const sharedClasses =
    "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded font-sans font-medium border-0 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border-inherit before:content-[''] enabled:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-9 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:cursor-not-allowed disabled:opacity-disabled";

  const colorSchemeClasses: Record<ButtonColorScheme, string> = {
    primary:
      'bg-interactive-primary text-white enabled:hover:bg-interactive-primary-hover focus-visible:bg-interactive-primary-hover enabled:active:bg-interactive-primary-press',
    secondary:
      'before:border border-brand bg-interactive-secondary text-brand enabled:hover:bg-interactive-secondary-hover enabled:active:bg-interactive-secondary-press disabled:bg-background-primary',
    tertiary:
      'before:border border-secondary bg-surface-primary text-primary enabled:hover:bg-[color-mix(in_srgb,var(--color-surface-primary),#756f6d_15%)] enabled:active:bg-interactive-tertiary-press',
    ghost:
      'bg-transparent text-primary enabled:hover:bg-interactive-tertiary-hover enabled:active:bg-interactive-tertiary-press focus-visible:bg-surface-primary',
    danger:
      'bg-red-11 text-white enabled:hover:bg-alpha-red-90 enabled:active:bg-alpha-red-80',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    md: 'gap-2 px-3 py-1 text-base leading-6',
    sm: 'gap-1 px-2 py-1 text-xs leading-4',
    xs: 'gap-1 px-1 py-0.5 text-xs leading-4',
  };

  const iconOnlyClasses: Record<ButtonSize, string> = {
    md: 'p-2',
    sm: 'p-1',
    xs: 'p-1',
  };
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  let {
    variant = 'default',
    colorScheme = 'primary',
    size = 'md',
    children,
    Icon,
    LeadingIcon,
    TrailingIcon,
    trailingElement,
    class: className,
    type = 'button',
    ...rest
  }: ButtonProps = $props();

  const iconSize = $derived(size === 'md' ? 16 : 12);
</script>

<button
  {...rest}
  {type}
  class={twMerge(
    sharedClasses,
    colorSchemeClasses[colorScheme],
    sizeClasses[size],
    variant === 'icon' && iconOnlyClasses[size],
    variant === 'icon' &&
      colorScheme === 'secondary' &&
      'enabled:active:bg-indigo-12',
    variant === 'icon' &&
      colorScheme === 'tertiary' &&
      'enabled:active:bg-neutral-10',
    variant === 'icon' &&
      colorScheme === 'ghost' &&
      size === 'xs' &&
      'focus-visible:bg-background-primary',
    variant === 'icon' &&
      colorScheme === 'danger' &&
      size === 'sm' &&
      'disabled:opacity-[0.21]',
    className,
  )}
>
  {#if variant === 'icon' && Icon}
    <Icon width={iconSize} height={iconSize} />
  {:else}
    {#if LeadingIcon}
      <LeadingIcon width={iconSize} height={iconSize} />
    {/if}
    {@render children?.()}
    {#if TrailingIcon}
      <TrailingIcon width={iconSize} height={iconSize} />
    {/if}
    {@render trailingElement?.()}
  {/if}
</button>
