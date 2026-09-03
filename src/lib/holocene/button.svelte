<script module lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import { cva, type VariantProps } from 'class-variance-authority';
  import type { Snippet } from 'svelte';

  import type { IconComponent } from '$lib/io/icon';

  const buttonStyles = cva(
    [
      'relative',
      'rounded',
      'flex',
      'w-fit',
      'items-center',
      'justify-center',
      'border',
      'gap-2',
      'disabled:opacity-disabled',
      'disabled:cursor-not-allowed',
      'border-box',
      'transition-colors',
      'transition-shadow',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-interactive-primary',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background-primary',
      'whitespace-nowrap',
      'no-underline',
      'active:scale-[0.98]',
      'transition-all duration-200',
    ],
    {
      variants: {
        variant: {
          primary:
            'border-transparent bg-interactive-primary text-white hover:bg-interactive-primary-hover active:bg-interactive-primary-press focus-visible:bg-interactive-primary-hover',
          secondary:
            'border-brand bg-surface-primary text-brand hover:bg-interactive-secondary-hover active:bg-interactive-secondary-press focus-visible:bg-surface-primary data-[active=true]:border-transparent data-[active=true]:bg-interactive-primary data-[active=true]:text-white data-[active=true]:hover:bg-interactive-primary-hover data-[active=true]:active:bg-interactive-primary-press data-[active=true]:focus-visible:bg-interactive-primary-hover',
          tertiary:
            'border-tertiary bg-transparent text-primary hover:bg-interactive-tertiary-hover active:bg-interactive-tertiary-press focus-visible:bg-surface-primary data-[active=true]:border-transparent data-[active=true]:bg-interactive-primary data-[active=true]:text-white data-[active=true]:hover:bg-interactive-primary-hover data-[active=true]:active:bg-interactive-tertiary-press data-[active=true]:focus-visible:bg-interactive-primary-hover',
          destructive:
            'border-transparent bg-interactive-danger text-white hover:bg-interactive-danger-hover active:bg-interactive-danger-press focus-visible:bg-interactive-danger',
          ghost:
            'border-transparent bg-transparent text-secondary hover:bg-interactive-tertiary-hover active:bg-interactive-tertiary-press focus-visible:bg-surface-primary data-[active=true]:bg-interactive-tertiary-press data-[active=true]:hover:bg-interactive-tertiary-hover data-[active=true]:active:bg-interactive-tertiary-press data-[active=true]:focus-visible:bg-interactive-tertiary-hover',
          'table-header':
            'border-transparent bg-transparent text-primary focus-visible:border-transparent',
        },
        size: {
          xs: 'h-8 text-xs px-2 py-1',
          sm: 'h-9 text-sm px-4 py-1.5',
          md: 'h-10 text-base px-4 py-2',
          lg: 'h-11 text-lg px-5 py-2.5',
        },
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md',
      },
    },
  );

  export type ButtonStyles = VariantProps<typeof buttonStyles>;

  interface BaseProps {
    variant?: ButtonStyles['variant'];
    size?: ButtonStyles['size'];
    disabled?: boolean;
    loading?: boolean;
    active?: boolean;
    LeadingIcon?: IconComponent;
    TrailingIcon?: IconComponent;
    count?: number;
    id?: string;
    disableTracking?: boolean;
    class?: string;
    'data-testid'?: string;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
    onkeydown?: (event: KeyboardEvent) => void;
  }

  export type ButtonWithoutHrefProps = BaseProps &
    Omit<HTMLButtonAttributes, 'class' | 'onclick' | 'onkeydown'> & {
      href?: never;
      target?: never;
    };

  export type ButtonWithHrefProps = BaseProps &
    Omit<HTMLAnchorAttributes, 'class' | 'onclick' | 'onkeydown'> & {
      href: string;
      target?: HTMLAnchorAttributes['target'];
    };

  export type ButtonProps = ButtonWithoutHrefProps | ButtonWithHrefProps;
</script>

<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import { BadgeCount } from '$lib/io/badge-count';
  import { IconSpinner } from '$lib/io/icon';

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    active = false,
    LeadingIcon,
    TrailingIcon,
    count = 0,
    id,
    href,
    target,
    disableTracking = false,
    class: className = '',
    children,
    onclick,
    onkeydown,
    ...rest
  }: ButtonProps = $props();

  let element = $state<HTMLElement>();

  export function focus() {
    element?.focus();
  }

  const onLinkClick = (event: MouseEvent) => {
    // Skip if middle mouse click or new tab
    if (event.button === 1 || target || event.metaKey) return;
    if (!href) return;
    event.preventDefault();
    goto(href);
  };

  const handleLinkClick = (event: MouseEvent) => {
    event.stopPropagation();
    onLinkClick(event);
    onclick?.(event);
  };

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    onclick?.(event);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    event.stopPropagation();
    onkeydown?.(event);
  };

  const dataTrackObj = $derived(
    disableTracking
      ? {}
      : {
          'data-track-name': 'button',
          'data-track-intent': variant,
          'data-track-text': '*textContent*',
        },
  );
</script>

{#if href && !disabled}
  <a
    bind:this={element}
    {href}
    {id}
    role="button"
    target={target ? '_blank' : null}
    rel={target ? 'noreferrer' : null}
    data-variant={variant}
    data-active={active}
    {...dataTrackObj}
    class={merge(buttonStyles({ variant, size }), className)}
    tabindex={href ? null : 0}
    {...rest as HTMLAnchorAttributes}
    onclick={handleLinkClick}
    onkeydown={handleKeydown}
  >
    {#if LeadingIcon || (loading && !TrailingIcon)}
      {@const LeadingGlyph = loading ? IconSpinner : LeadingIcon!}
      <span class:animate-spin={loading}>
        <LeadingGlyph />
      </span>
    {/if}
    {@render children?.()}
    {#if TrailingIcon}
      {@const TrailingGlyph =
        loading && !LeadingIcon ? IconSpinner : TrailingIcon}
      <span
        class:animate-spin={loading && !LeadingIcon}
        class:invisible={loading && LeadingIcon}
      >
        <TrailingGlyph />
      </span>
    {/if}
    {#if count > 0}
      <BadgeCount
        class="absolute right-0 top-0 translate-x-[10px] translate-y-[-10px]"
        variant="single"
        value={count}
      />
    {/if}
  </a>
{:else}
  <button
    bind:this={element}
    {disabled}
    {id}
    type="button"
    data-variant={variant}
    data-active={active}
    {...dataTrackObj}
    class={merge(buttonStyles({ variant, size }), className)}
    {...rest as HTMLButtonAttributes}
    onclick={handleClick}
    onkeydown={handleKeydown}
  >
    {#if LeadingIcon || (loading && !TrailingIcon)}
      {@const LeadingGlyph = loading ? IconSpinner : LeadingIcon!}
      <span class:animate-spin={loading}>
        <LeadingGlyph />
      </span>
    {/if}
    {@render children?.()}

    {#if TrailingIcon}
      {@const TrailingGlyph =
        loading && !LeadingIcon ? IconSpinner : TrailingIcon}
      <span
        class:animate-spin={loading && !LeadingIcon}
        class:invisible={loading && LeadingIcon}
      >
        <TrailingGlyph />
      </span>
    {/if}
    {#if count > 0}
      <BadgeCount
        class="absolute right-0 top-0 translate-x-[10px] translate-y-[-10px]"
        variant="single"
        value={count}
      />
    {/if}
  </button>
{/if}
