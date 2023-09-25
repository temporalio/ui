<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import type { IconName } from '$lib/holocene/icon/paths';

  import Icon from './icon/icon.svelte';

  type $$Props = HTMLAnchorAttributes & {
    href?: string;
    active?: boolean;
    newTab?: boolean;
    class?: string;
    icon?: IconName;
    'data-testid'?: string;
  };

  let className = '';
  export { className as class };
  export let href: string = null;
  export let active = false;
  export let newTab = false;
  export let icon: IconName = null;
</script>

<a
  {href}
  target={newTab ? '_blank' : null}
  rel={newTab ? 'noreferrer' : null}
  class="link {className}"
  class:active
  on:click
  {...$$restProps}
>
  {#if icon}
    <Icon width={20} height={20} class="mt-0.5" name={icon} />
  {/if}
  <slot />
</a>

<style lang="postcss">
  .link {
    @apply inline-flex max-w-fit cursor-pointer items-center gap-2 rounded underline underline-offset-2 hover:text-indigo-600 focus-visible:bg-blue-100 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:outline-none;

    &.active {
      @apply text-blue-900;
    }
  }
</style>
