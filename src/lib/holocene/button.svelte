<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import { cva, type VariantProps } from 'class-variance-authority';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  const buttonStyles = cva(
    [
      'relative',
      'flex',
      'w-fit',
      'items-center',
      'justify-center',
      'gap-2',
      'rounded-lg',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'border-2',
      'border-box',
      'transition-colors',
      'transition-shadow',
      'focus-visible:outline-none',
    ],
    {
      variants: {
        variant: {
          primary:
            'border-gray-900 bg-gray-900 bg-gradient-to-br text-white [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-blue-600/50 [&:not(:disabled):hover]:from-blue-100 [&:not(:disabled):hover]:to-purple-100 [&:not(:disabled):hover]:text-gray-900 [&:not(:disabled):hover]:border-indigo-600 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:from-blue-100 focus-visible:to-purple-100 focus-visible:text-gray-900 focus-visible:border-indigo-600',
          secondary:
            'border-gray-900 bg-white text-gray-900 [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-blue-600/50 [&:not(:disabled):hover]:bg-gray-900 [&:not(:disabled):hover]:text-white [&:not(:disabled):hover]:border-white focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:bg-gray-900 focus-visible:text-white focus-visible:border-white',
          destructive:
            'border-red-700 bg-red-700 text-white [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-red-200/50 [&:not(:disabled):hover]:border-white focus-visible:border-white focus-visible:shadow-focus focus-visible:shadow-red-200/50',
          ghost:
            'border-[transparent] bg-[transparent] text-gray-600 [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-blue-600/50 [&:not(:disabled):hover]:bg-indigo-100 [&:not(:disabled):hover]:border-indigo-600 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:bg-indigo-100 focus-visible:border-indigo-600',
          'table-header':
            'border-gray-900 bg-gray-900 text-white focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:border-white',
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

<svelte:element
  this={href && !disabled ? 'a' : 'button'}
  {target}
  href={disabled ? null : href}
  {disabled}
  {id}
  role="button"
  type="button"
  class:active
  on:click|stopPropagation
  class={buttonStyles({ variant, size, borderModifier, borderRadiusModifier })}
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
</svelte:element>

<style lang="postcss">
  .active {
    @apply bg-indigo-100;
  }

  a[type='button'] {
    appearance: none;
  }
</style>
