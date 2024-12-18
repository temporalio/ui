<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import type { IconName } from '$lib/holocene/icon';

  import Icon from './icon/icon.svelte';

  type $$Props = HTMLAnchorAttributes & {
    href: string;
    active?: boolean;
    newTab?: boolean;
    class?: string;
    icon?: IconName;
    text?: string;
    light?: boolean;
    'data-testid'?: string;
  };

  let className = '';
  export { className as class };
  export let href: string;
  export let active = false;
  export let newTab = false;
  export let icon: IconName = null;
  export let text: string = '';
  export let light = false;

  const onLinkClick = (e: MouseEvent) => {
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
  class:light
  on:click|stopPropagation={onLinkClick}
  tabindex={href ? null : 0}
  {...$$restProps}
>
  {#if icon}
    <Icon class="mt-0.5" name={icon} />
  {/if}
  {#if text}
    {text}
  {/if}
  <slot />
</a>

<style lang="postcss">
  .link {
    @apply max-w-fit cursor-pointer items-center gap-2 text-primary underline underline-offset-2 hover:text-brand focus-visible:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70;

    &.active {
      @apply text-brand;
    }

    &.light {
      @apply text-off-white hover:text-indigo-400;
    }
  }

  .link[role='button'] {
    @apply no-underline;
  }
</style>
