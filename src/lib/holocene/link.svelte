<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import type { IconName } from '$lib/holocene/icon';

  import Icon from './icon/icon.svelte';

  type $$Props = HTMLAnchorAttributes & {
    href: string;
    active?: boolean;
    interactive?: boolean;
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
  export let interactive = false;
  export let newTab = false;
  export let icon: IconName = null;
  export let text: string = '';
  export let light = false;

  const onLinkClick = (e: MouseEvent) => {
    if (e.button === 1 || newTab || e.metaKey || e.ctrlKey || e.shiftKey)
      return;

    e.preventDefault();
    goto(href);
  };
</script>

<a
  {href}
  target={newTab ? '_blank' : null}
  rel={newTab ? 'noreferrer noopener' : null}
  class={merge(
    'link text-primary hover:text-brand focus-visible:text-brand focus-visible:ring-primary/70 focus-visible:outline-hidden max-w-fit cursor-pointer items-center gap-2 underline underline-offset-2 focus-visible:ring-2',
    active ? 'text-brand' : '',
    interactive
      ? 'text-white hover:text-indigo-200 focus-visible:text-indigo-200'
      : '',
    light ? 'text-off-white hover:text-indigo-400' : '',
    icon ? 'inline-flex' : 'inline',
    className,
  )}
  class:active
  class:interactive
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
  @reference "tailwindcss";

  /* Link styles moved to inline */

  .link[role='button'] {
    @apply no-underline;
  }
</style>
