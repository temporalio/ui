<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

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

  type ButtonStyles = VariantProps<typeof buttonStyles>;

  export type BaseProps = ButtonStyles & {
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: IconName;
    trailingIcon?: IconName;
    count?: number;
    id?: string;
    'data-testid'?: string;
    href?: string;
    target?: HTMLAnchorAttributes['target'];
  };

  export type ButtonWithoutHrefProps = BaseProps & HTMLButtonAttributes;

  export type ButtonWithHrefProps = BaseProps & HTMLAnchorAttributes;

  type Props = ButtonWithoutHrefProps | ButtonWithHrefProps;
</script>

<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
    KeyboardEventHandler,
    MouseEventHandler,
  } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  let props: Props = $props();

  const isLink = (props: Props): props is ButtonWithHrefProps => {
    return 'href' in props && !props.disabled;
  };

  const handleClick: MouseEventHandler<
    HTMLButtonElement & HTMLAnchorElement
  > = (event) => {
    event.stopPropagation();
    props.onclick?.(event);
  };

  const handleKeydown: KeyboardEventHandler<
    HTMLButtonElement & HTMLAnchorElement
  > = (event) => {
    event.stopPropagation();
    props.onkeydown?.(event);
  };

  const className = merge(
    buttonStyles({ variant: props.variant, size: props.size }),
    props.class,
  );
</script>

{#snippet buttonContent()}
  {@const { leadingIcon, loading, trailingIcon, count, children } = props}
  {#if leadingIcon || loading}
    <span class:animate-spin={loading}>
      <Icon name={loading ? 'spinner' : leadingIcon} />
    </span>
  {/if}
  {@render children?.()}
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
{/snippet}

{#if isLink(props)}
  {@const { href, id, target, ...rest } = props}
  <a
    {href}
    {id}
    role="button"
    type="button"
    target={target ? '_blank' : null}
    rel={target ? 'noreferrer' : null}
    class={className}
    onclick={handleClick}
    tabindex={href ? null : 0}
    {...rest}
  >
    {@render buttonContent()}
  </a>
{:else}
  {@const { id, disabled, ...rest } = props}
  <button
    {disabled}
    {id}
    type="button"
    onclick={handleClick}
    onkeydown={handleKeydown}
    class={className}
    {...rest}
  >
    {@render buttonContent()}
  </button>
{/if}
