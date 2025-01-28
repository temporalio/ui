<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import type { IconName } from '$lib/holocene/icon';

  import Icon from './icon/icon.svelte';

  interface Props extends HTMLAnchorAttributes {
    href: string;
    active?: boolean;
    interactive?: boolean;
    newTab?: boolean;
    class?: string;
    icon?: IconName;
    text?: string;
    light?: boolean;
    'data-testid'?: string;
  }

  let {
    class: className = '',
    href,
    active = false,
    interactive = false,
    newTab = false,
    icon = null,
    text = '',
    light = false,
    children,
    ...rest
  }: Props = $props();

  const onLinkClick = (e: MouseEvent) => {
    e.stopPropagation();
    // Skip if middle mouse click or new tab
    if (e.button === 1 || newTab || e.metaKey) return;
    e.preventDefault();
    goto(href);
  };
</script>

<a
  {href}
  target={newTab ? '_blank' : null}
  rel={newTab ? 'noreferrer' : null}
  class={merge('link', icon ? 'inline-flex' : 'inline', className)}
  class:active
  class:interactive
  class:light
  onclick={onLinkClick}
  tabindex={href ? null : 0}
  {...rest}
>
  {#if icon}
    <Icon class="mt-0.5" name={icon} />
  {/if}
  {#if text}
    {text}
  {/if}
  {@render children?.()}
</a>

<style lang="postcss">
  .link {
    @apply max-w-fit cursor-pointer items-center gap-2 text-primary underline underline-offset-2 hover:text-brand focus-visible:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70;

    &.active {
      @apply text-brand;
    }

    &.interactive {
      @apply text-white hover:text-indigo-200 focus-visible:text-indigo-200;
    }

    &.light {
      @apply text-off-white hover:text-indigo-400;
    }
  }

  .link[role='button'] {
    @apply no-underline;
  }
</style>
