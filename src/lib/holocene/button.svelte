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
      'focus:outline-none',
    ],
    {
      variants: {
        variant: {
          primary:
            'border-gray-900 bg-gray-900 bg-gradient-to-br text-white [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-blue-600/50 [&:not(:disabled):hover]:from-blue-100 [&:not(:disabled):hover]:to-purple-100 [&:not(:disabled):hover]:text-gray-900 [&:not(:disabled):hover]:border-indigo-600 focus:shadow-focus focus:shadow-blue-600/50 focus:from-blue-100 focus:to-purple-100 focus:text-gray-900 focus:border-indigo-600',
          secondary:
            'border-gray-900 bg-white text-gray-900 [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-blue-600/50 [&:not(:disabled):hover]:bg-gray-900 [&:not(:disabled):hover]:text-white [&:not(:disabled):hover]:border-white focus:shadow-focus focus:shadow-blue-600/50 focus:bg-gray-900 focus:text-white focus:border-white disabled:hover',
          destructive:
            'border-red-700 bg-red-700 text-white [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-red-200/50 [&:not(:disabled):hover]:border-white focus:border-white focus:shadow-focus focus:shadow-red-200/50',
          ghost:
            'border-[transparent] bg-[transparent] text-gray-600 [&:not(:disabled):hover]:shadow-focus [&:not(:disabled):hover]:shadow-blue-600/50 [&:not(:disabled):hover]:bg-indigo-100 [&:not(:disabled):hover]:border-indigo-600 focus:shadow-focus focus:shadow-blue-600/50 focus:bg-indigo-100 focus:border-indigo-600',
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
    'data-testid'?: string;
  };

  type ButtonWithoutHrefProps = BaseProps & HTMLButtonAttributes;
  type ButtonWithHrefProps = BaseProps &
    HTMLAnchorAttributes & {
      href: string;
      target?: HTMLAnchorAttributes['target'];
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
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {target}
  {href}
  {disabled}
  {id}
  role="button"
  type="button"
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
      class="badge absolute top-0 right-0 origin-bottom-left translate-y-[-10px] translate-x-[10px]"
      type="count">{count}</Badge
    >
  {/if}
</svelte:element>

<style lang="postcss">
  .button {
    @apply relative flex w-fit items-center justify-center gap-2 rounded-lg font-secondary text-sm;
  }

  .primary,
  .secondary,
  .destructive,
  .login {
    @apply border-2 py-2.5 px-4 transition-colors;
  }

  .search {
    @apply border py-2.5 px-4 h-10 transition-colors;
  }

  .button:disabled {
    @apply cursor-not-allowed;
  }

  .large {
    @apply text-lg;
  }

  .primary,
  .login {
    @apply border-primary bg-primary bg-gradient-to-br text-white hover:from-blue-100 hover:to-purple-100 hover:text-primary;
  }

  .primary:disabled,
  .login:disabled {
    @apply text-white opacity-75 hover:from-primary hover:to-primary;
  }

  .secondary,
  .search {
    @apply border-gray-800 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:text-white;
  }

  .secondary:disabled,
  .search:disabled {
    @apply opacity-75 hover:border-gray-800 hover:bg-white hover:text-gray-800;
  }

  .destructive {
    @apply border-danger bg-danger px-5 text-white hover:border-red-900 hover:bg-red-900;
  }

  .destructive:disabled {
    @apply opacity-50 hover:border-danger hover:bg-danger;
  }

  .ghost:hover {
    box-shadow: 0 0 0 4px #a4bcfd;
  }

  .selected {
    @apply bg-gradient-to-br from-blue-100 to-purple-100 text-gray-900;
  }

  .login {
    @apply mx-auto;
  }

  .thin {
    @apply h-8 py-1;
  }

  .unround {
    @apply rounded-none;
  }

  .unroundLeft {
    @apply rounded-tl-none rounded-bl-none;
  }

  .unroundRight {
    @apply rounded-tr-none rounded-br-none;
  }

  .noBorderLeft {
    @apply border-l-0;
  }

  .noBorderRight {
    @apply border-r-0;
  }
</style>
