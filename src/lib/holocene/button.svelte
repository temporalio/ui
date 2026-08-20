<script module lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import { cva, type VariantProps } from 'class-variance-authority';
  import type { Snippet } from 'svelte';

  import type { IconName } from '$lib/holocene/icon';

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
      'focus-visible:ring-2',
      'focus-visible:ring-io-interactive-primary',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-io-background-primary',
      'whitespace-nowrap',
      'no-underline',
      'active:scale-[0.98]',
      'transition-all duration-200',
    ],
    {
      variants: {
        variant: {
          primary:
            'border-transparent bg-io-interactive-primary text-io-content-white hover:bg-io-interactive-primary-hover active:bg-io-interactive-primary-press focus-visible:bg-io-interactive-primary-hover data-[active=true]:bg-io-interactive-secondary-press data-[active=true]:text-io-content-primary',
          secondary:
            'border-io-border-tertiary bg-io-interactive-secondary text-io-content-primary hover:bg-io-actions-hover-overlay active:bg-io-actions-press-overlay focus-visible:bg-io-interactive-secondary data-[active=true]:bg-io-actions-press-overlay',
          destructive:
            'border-transparent bg-io-interactive-danger text-io-content-white hover:bg-io-interactive-danger-hover active:bg-io-interactive-danger-press focus-visible:bg-io-interactive-danger data-[active=true]:bg-io-interactive-danger-press',
          ghost:
            'border-transparent bg-transparent text-io-content-secondary hover:bg-io-actions-hover-overlay active:bg-io-actions-press-overlay focus-visible:bg-io-interactive-secondary data-[active=true]:bg-io-actions-press-overlay data-[active=true]:text-io-content-primary',
          'table-header':
            'border-transparent bg-transparent text-io-content-primary focus-visible:border-transparent',
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
    leadingIcon?: IconName;
    trailingIcon?: IconName;
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
  import Icon from '$lib/holocene/icon/icon.svelte';

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    active = false,
    leadingIcon,
    trailingIcon,
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
    {#if leadingIcon || (loading && !trailingIcon)}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : leadingIcon!} />
      </span>
    {/if}
    {@render children?.()}
    {#if trailingIcon}
      <span
        class:animate-spin={loading && !leadingIcon}
        class:invisible={loading && leadingIcon}
      >
        <Icon name={loading && !leadingIcon ? 'spinner' : trailingIcon} />
      </span>
    {/if}
    {#if count > 0}
      <Badge
        class="badge absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px] bg-io-interactive-secondary text-io-content-primary"
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
    {#if leadingIcon || (loading && !trailingIcon)}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : leadingIcon!} />
      </span>
    {/if}
    {@render children?.()}

    {#if trailingIcon}
      <span
        class:animate-spin={loading && !leadingIcon}
        class:invisible={loading && leadingIcon}
      >
        <Icon name={loading && !leadingIcon ? 'spinner' : trailingIcon} />
      </span>
    {/if}
    {#if count > 0}
      <Badge
        class="badge absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px] bg-io-interactive-secondary text-io-content-primary"
        type="count">{count}</Badge
      >
    {/if}
  </button>
{/if}
