<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { getAppContext } from '$lib/utilities/get-context';

  import type {
    ButtonProps,
    ButtonWithHrefProps,
    ButtonWithoutHrefProps,
  } from '../button.svelte';
  import Button from '../button.svelte';

  type ToggleBaseProps = {
    group?: boolean;
    active?: boolean;
    showLabelOnSmallScreens?: boolean;
  };

  type AnchorProps = ToggleBaseProps &
    ButtonWithHrefProps & {
      base?: string;
    };

  type ButtonToggleProps = ToggleBaseProps &
    ButtonWithoutHrefProps & {
      base?: never;
    };

  type Props = AnchorProps | ButtonToggleProps;

  let {
    class: className = '',
    group = getAppContext('group'),
    href,
    base,
    active = false,
    showLabelOnSmallScreens = false,
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
      group && 'border rounded-control',
      className,
    ),
  } as ButtonProps);
</script>

<Button {...buttonProps}>
  {#if leadingIcon}
    <span class={showLabelOnSmallScreens ? undefined : 'hidden md:block'}
      >{@render children?.()}</span
    >
  {:else}
    {@render children?.()}
  {/if}
</Button>
