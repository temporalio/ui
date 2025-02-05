<script context="module" lang="ts">
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
    ],
    {
      variants: {
        variant: {
          primary:
            'surface-interactive border-transparent text-white focus-visible:ring-primary/70',
          secondary:
            'surface-primary border-subtle focus-visible:ring-primary/70 hover:surface-interactive-secondary focus-visible:surface-interactive-secondary',
          destructive:
            'surface-interactive-danger border-transparent focus-visible:ring-danger/70',
          ghost:
            'bg-transparent border-transparent text-primary hover:surface-interactive-ghost focus-visible:surface-interactive-ghost focus-visible:ring-primary/70',
          'table-header':
            'bg-transparent border-transparent text-off-white focus-visible:ring-primary/70 focus-visible:border-transparent',
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

  type BaseProps = {
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: IconName;
    trailingIcon?: IconName;
    count?: number;
    id?: string;
    'data-testid'?: string;
  };

  export type ButtonStyles = VariantProps<typeof buttonStyles>;

  export type ButtonWithoutHrefProps = BaseProps &
    ButtonStyles &
    HTMLButtonAttributes;

  export type ButtonWithHrefProps = BaseProps &
    ButtonStyles &
    HTMLAnchorAttributes & {
      href: string;
      target?: HTMLAnchorAttributes['target'];
      disabled?: boolean;
    };
</script>

<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import { cva, type VariantProps } from 'class-variance-authority';
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  type $$Props = ButtonWithoutHrefProps | ButtonWithHrefProps;

  export let variant: ButtonStyles['variant'] = 'primary';
  export let size: ButtonStyles['size'] = 'md';
  export let disabled = false;
  export let loading = false;
  export let leadingIcon: IconName = null;
  export let trailingIcon: IconName = null;
  export let count = 0;
  export let id: string = null;
  export let href: string = null;
  export let target: string = null;

  let className = '';
  export { className as class };

  const onLinkClick = (e: MouseEvent) => {
    // Skip if middle mouse click or new tab
    if (e.button === 1 || target || e.metaKey) return;
    e.preventDefault();
    goto(href);
  };
</script>

{#if href && !disabled}
  <a
    {href}
    {id}
    role="button"
    type="button"
    target={target ? '_blank' : null}
    rel={target ? 'noreferrer' : null}
    class={merge(
      buttonStyles({
        variant,
        size,
      }),
      className,
    )}
    on:click|stopPropagation={onLinkClick}
    tabindex={href ? null : 0}
    {...$$restProps}
  >
    {#if leadingIcon || loading}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : leadingIcon} />
      </span>
    {/if}
    <slot />
    {#if trailingIcon}
      <span>
        <Icon name={trailingIcon} />
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
    {disabled}
    {id}
    type="button"
    on:click|stopPropagation
    on:keydown|stopPropagation
    class={merge(
      buttonStyles({
        variant,
        size,
      }),
      className,
    )}
    {...$$restProps}
  >
    {#if leadingIcon || loading}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : leadingIcon} />
      </span>
    {/if}
    <slot />
    {#if trailingIcon}
      <span>
        <Icon name={trailingIcon} />
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
