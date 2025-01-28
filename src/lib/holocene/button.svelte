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

  type BaseProps = ButtonStyles & {
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: IconName;
    trailingIcon?: IconName;
    count?: number;
    id?: string;
    'data-testid'?: string;
    onclick?: (e: MouseEvent) => void;
  };

  export type ButtonWithoutHrefProps = BaseProps &
    HTMLButtonAttributes & {
      onkeydown?: (e: KeyboardEvent) => void;
      href?: never;
      target?: never;
    };
  export type ButtonWithHrefProps = BaseProps &
    HTMLAnchorAttributes & {
      onkeydown?: never;
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

  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  type Props = ButtonWithoutHrefProps | ButtonWithHrefProps;

  let props: Props = $props();

  const onLinkClick = (e: MouseEvent) => {
    // Skip if middle mouse click or new tab
    if (e.button === 1 || props.target || e.metaKey) return;
    e.preventDefault();
    goto(props.href);
  };

  const isLink = (props: Props): props is ButtonWithHrefProps => {
    return props.href && !props.disabled;
  };
</script>

{#if isLink(props)}
  {@const {
    variant = 'primary',
    size = 'md',
    loading = false,
    leadingIcon = null,
    trailingIcon = null,
    count = 0,
    id = null,
    href = null,
    target = null,
    class: className = '',
    children,
    onclick = () => {},
    ...rest
  } = props}
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
    onclick={(e: MouseEvent) => {
      e.stopPropagation();
      onclick(e);
      onLinkClick(e);
    }}
    tabindex={href ? null : 0}
    {...rest}
  >
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
  </a>
{:else}
  {@const {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    leadingIcon = null,
    trailingIcon = null,
    count = 0,
    id = null,
    class: className = '',
    children,
    onclick = () => {},
    onkeydown = () => {},
    ...rest
  } = props}
  <button
    {disabled}
    {id}
    type="button"
    onclick={(e: MouseEvent) => {
      e.stopPropagation();
      onclick(e);
    }}
    onkeydown={(e: KeyboardEvent) => {
      e.stopPropagation();
      onkeydown(e);
    }}
    class={merge(
      buttonStyles({
        variant,
        size,
      }),
      className,
    )}
    {...rest}
  >
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
  </button>
{/if}
