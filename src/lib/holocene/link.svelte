<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import type { IconName } from '$lib/holocene/icon/paths';

  import Icon from './icon/icon.svelte';

  type $$Props = HTMLAnchorAttributes & {
    href: string;
    active?: boolean;
    newTab?: boolean;
    class?: string;
    icon?: IconName;
    text?: string;
    'data-testid'?: string;
  };

  let className = '';
  export { className as class };
  export let href: string;
  export let active = false;
  export let newTab = false;
  export let icon: IconName = null;
  export let text: string = '';

  const onLinkClick = (e: MouseEvent) => {
    // Skip if middle mouse click or new tab
    if (e.button === 1 || newTab || e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();
    goto(href);
  };
</script>

<a
  {href}
  target={newTab ? '_blank' : null}
  rel={newTab ? 'noreferrer' : null}
  class={merge('link ', icon ? 'inline-flex' : 'inline', className)}
  class:active
  on:click={onLinkClick}
  tabindex={href ? null : 0}
  {...$$restProps}
>
  {#if icon}
    <Icon width={20} height={20} class="mt-0.5" name={icon} />
  {/if}
  {#if text}
    {text}
  {/if}
  <slot />
</a>

<style lang="postcss">
  .link {
    @apply max-w-fit cursor-pointer items-center gap-2 rounded underline underline-offset-2 hover:text-indigo-600 focus-visible:bg-blue-100 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:outline-none;

    &.active {
      @apply text-blue-900;
    }
  }

  .link[role='button'] {
    @apply no-underline;
  }
</style>
