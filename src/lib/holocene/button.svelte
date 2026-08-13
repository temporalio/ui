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
      'flex',
      'w-fit',
      'items-center',
      'justify-center',
      'border',
      'gap-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'border-box',
      'transition-colors',
      'transition-shadow',
      'focus-visible:outline-none',
      'focus-visible:border-inverse',
      'focus-visible:ring-2',
      'whitespace-nowrap',
      'no-underline',
      'active:scale-[0.98]',
      'transition-all duration-200',
    ],
    {
      variants: {
        variant: {
          primary:
            'surface-interactive border-transparent text-white focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary data-[active=true]:bg-subtle data-[active=true]:text-primary',
          secondary:
            'surface-primary border-subtle focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary hover:surface-interactive-secondary focus-visible:surface-interactive-secondary data-[active=true]:bg-subtle',
          destructive:
            'surface-interactive-danger border-transparent focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary data-[active=true]:surface-interactive-danger',
          ghost:
            'bg-transparent border-transparent text-primary hover:surface-interactive-ghost focus-visible:surface-interactive-ghost focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary data-[active=true]:bg-subtle',
          'table-header':
            'bg-transparent border-transparent focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary focus-visible:border-transparent',
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

  import Badge from '$lib/holocene/badge.svelte';
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
      <Badge
        class="badge absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px]"
        type="count">{count}</Badge
      >
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
      <Badge
        class="badge absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px]"
        type="count">{count}</Badge
      >
    {/if}
  </button>
{/if}
