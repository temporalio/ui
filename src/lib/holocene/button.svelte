<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import { cva, type VariantProps } from 'class-variance-authority';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  import Link from './link.svelte';

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
    ],
    {
      variants: {
        variant: {
          primary:
            'bg-interactive border-interactive text-inverse hover:enabled:bg-interactive-hover hover:enabled:shadow-focus hover:enabled:shadow-indigo-600/50 hover:enabled:border-white dark:hover:enabled:border-black focus-visible:shadow-focus focus-visible:shadow-indigo-600/50 ',
          secondary:
            'border-secondary text-primary hover:enabled:shadow-focus hover:enabled:shadow-indigo-600 hover:enabled:surface-interactive-secondary hover:enabled:border-white dark:hover:enabled:border-black focus-visible:shadow-focus focus-visible:shadow-indigo-600/50 focus-visible:bg-inverse focus-visible:border-white',
          destructive:
            'border-danger bg-danger dark:hover:enabled:shadow-red-600/30 hover:enabled:bg-red-400 hover:enabled:border-white dark:hover:enabled:border-black dark:hover:enabled:border-red-400/50 dark:hover:enabled:bg-red-400 focus-visible:shadow-focus dark:focus-visible:shadow-red-600/30 focus-visible:shadow-red-200/50 focus-visible:border-white dark:focus-visible:border-red-400/50 dark:focus-visible:bg-red-400',
          ghost:
            'border-transparent bg-transparent text-primary hover:enabled:shadow-focus hover:enabled:shadow-indigo-600/50 hover:enabled:surface-interactive-secondary hover:enabled:border-white dark:hover:enabled:border-black focus-visible:shadow-focus focus-visible:shadow-indigo-600/50 focus-visible:bg-inverse ',
          'table-header':
            ' bg-inverse text-white focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:border-white',
        },
        size: {
          xs: 'h-8 text-xs px-2 py-1',
          sm: 'h-9 text-sm px-4 py-1.5',
          md: 'h-10 text-base px-4 py-2',
          lg: 'h-11 text-lg px-5 py-2.5',
        },
        borderModifier: {
          borderless: 'border-0',
          'borderless-left': 'border-l-0',
          'borderless-right': 'border-r-0',
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
  export let borderModifier: ButtonStyles['borderModifier'] = null;
  export let borderRadiusModifier: ButtonStyles['borderRadiusModifier'] = null;
  export let disabled = false;
  export let loading = false;
  export let leadingIcon: IconName = null;
  export let trailingIcon: IconName = null;
  export let count = 0;
  export let id: string = null;
  export let href: string = null;
  export let target: string = null;
  export let active = false;
</script>

{#if href && !disabled}
  <Link
    {target}
    {href}
    {id}
    role="button"
    type="button"
    class={buttonStyles({
      variant,
      size,
      borderModifier,
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
  </Link>
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
      borderModifier,
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
