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

  const buttonStyles = cva(
    [
      'relative',
      'flex',
      'w-fit',
      'items-center',
      'justify-center',
      'border',
      'gap-2',
      'rounded-lg',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'border-box',
      'transition-colors',
      'transition-shadow',
      'focus-visible:outline-none',
      'whitespace-nowrap',
      '[input+&]:rounded-l-none',
      '[input+&]:rounded-r',
      '[input+&]:border-0',
      '[input+&]:active:border-0',
    ],
    {
      variants: {
        variant: {
          primary:
            'bg-interactive border-interactive text-white hover:text-white hover:bg-interactive-hover hover:border-interactive-hover focus-visible:bg-interactive-hover focus-visible:border-white dark:focus-visible:border-black focus-visible:shadow-focus focus-visible:shadow-primary/70',
          secondary:
            'border-secondary surface-input text-primary focus-visible:shadow-focus focus-visible:shadow-primary/70 hover:surface-interactive-secondary hover:border-interactive-secondary dark:hover:border-transparent focus-visible:surface-interactive-secondary focus-visible:border-white dark:focus-visible:border-black',
          destructive:
            'border-danger bg-danger text-primary hover:bg-red-400 hover:border-red-400 focus-visible:shadow-focus focus-visible:shadow-danger/50 focus-visible:border-white dark:focus-visible:border-red-400/50 dark:focus-visible:bg-red-400',
          ghost:
            'border-transparent bg-transparent text-primary hover:surface-interactive-secondary focus-visible:border-white dark:hover:border-black dark:focus-visible:border-black focus-visible:shadow-focus focus-visible:shadow-secondary/70 focus-visible:surface-interactive-secondary ',
          'table-header':
            'border-inverse surface-inverse hover:surface-primary focus-visible:shadow-focus focus-visible:shadow-primary/50 focus-visible:border-white',
        },
        size: {
          xs: 'h-8 text-xs px-2 py-1',
          sm: 'h-9 text-sm px-4 py-1.5',
          md: 'h-10 text-base px-4 py-2',
          lg: 'h-11 text-lg px-5 py-2.5',
        },

        borderRadiusModifier: {
          square: 'rounded-none',
          'square-left': 'rounded-l-none',
          'square-right': 'rounded-r-none',
        },
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md',
      },
    },
  );

  type BaseProps = {
    icon?: IconName;
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: IconName;
    trailingIcon?: IconName;
    count?: number;
    id?: string;
    active?: boolean;
    'data-testid'?: string;
  };

  type ButtonWithoutHrefProps = BaseProps & HTMLButtonAttributes;
  type ButtonWithHrefProps = BaseProps &
    HTMLAnchorAttributes & {
      href: string;
      target?: HTMLAnchorAttributes['target'];
      disabled?: boolean;
    };

  type ButtonStyles = VariantProps<typeof buttonStyles>;

  type $$Props = (ButtonWithoutHrefProps | ButtonWithHrefProps) & ButtonStyles;

  export let variant: ButtonStyles['variant'] = 'primary';
  export let size: ButtonStyles['size'] = 'md';
  export let borderRadiusModifier: ButtonStyles['borderRadiusModifier'] = null;
  export let disabled = false;
  export let loading = false;
  export let leadingIcon: IconName = null;
  export let trailingIcon: IconName = null;
  export let count = 0;
  export let id: string = null;
  export let icon: IconName = null;
  export let href: string = null;
  export let target: string = null;
  export let active = false;

  const onLinkClick = (e: MouseEvent) => {
    // Skip if middle mouse click or new tab
    if (e.button === 1 || target || e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();
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
      icon ? 'inline-flex' : 'inline',
      buttonStyles({
        variant,
        size,
        borderRadiusModifier,
      }),
    )}
    on:click={onLinkClick}
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
    class:active
    on:click|stopPropagation
    class={buttonStyles({
      variant,
      size,
      borderRadiusModifier,
    })}
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

<style lang="postcss">
  .active {
    @apply bg-interactive text-white;
  }
</style>
