<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { getAppContext } from '$lib/utilities/get-context';

  import type {
    ButtonProps,
    ButtonWithoutHrefProps,
  } from '../button-runes.svelte';
  import Button from '../button-runes.svelte';

  type Props = Omit<ButtonWithoutHrefProps, 'href' | 'target'> & {
    group?: boolean;
    active?: boolean;
    href?: string | null;
    base?: string | null;
  };

  let {
    class: className = '',
    group = getAppContext('group'),
    href = null,
    base = null,
    active = false,
    variant = 'secondary',
    leadingIcon,
    onclick,
    children,
    ...rest
  }: Props = $props();

  const pressed = $derived(
    href ? page.url.pathname.includes(base ?? href) : active,
  );

  const buttonProps = $derived({
    ...rest,
    variant,
    leadingIcon,
    onclick,
    'data-track-name': 'toggle-button',
    'aria-pressed': pressed ? 'true' : 'false',
    href: href ? href + page.url.search : undefined,
    class: merge(
      pressed && 'bg-interactive-secondary-active',
      group && '[&:not(:last-child)]:border-r-0',
      className,
    ),
  } as ButtonProps);
</script>

<Button {...buttonProps}>
  {#if leadingIcon}
    <span class="hidden md:block">{@render children?.()}</span>
  {:else}
    {@render children?.()}
  {/if}
</Button>
