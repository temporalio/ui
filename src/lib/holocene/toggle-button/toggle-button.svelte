<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import { getAppContext } from '$lib/utilities/get-context';

  type BaseProps = {
    icon?: IconName;
    group?: boolean;
    active?: boolean;
    'data-testid'?: string;
  };

  type AnchorProps = BaseProps &
    HTMLAnchorAttributes & {
      href: string;
      base?: string;
    };

  type ButtonProps = BaseProps &
    HTMLButtonAttributes & {
      href?: never;
      base?: never;
    };

  type $$Props = AnchorProps | ButtonProps;

  let className = '';
  export { className as class };
  export let icon: IconName = null;
  export let group = getAppContext('group');
  export let href = '';
  export let base = href;
  export let active = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  class="toggle-button {className}"
  class:group
  class:active={href ? $page.url.pathname.includes(base) : active}
  href={href ? href + $page.url.search : null}
  class:rounded-lg={!group}
  on:click
  role="button"
  tabindex="0"
  {...$$restProps}
>
  {#if icon}
    <div class="flex items-center gap-2">
      <Icon name={icon} />
      <span class="hidden md:block"><slot /></span>
    </div>
  {:else}
    <slot />
  {/if}
</svelte:element>

<style lang="postcss">
  .toggle-button {
    @apply flex items-center justify-center border-2 border-gray-900 px-4 py-2 text-sm transition-colors hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:text-primary focus:from-blue-100 focus:to-purple-100 focus:outline-none focus-visible:border-indigo-600 focus-visible:bg-gradient-to-br focus-visible:shadow-focus focus-visible:shadow-blue-600/50;
  }

  .toggle-button.active {
    @apply bg-gray-900 text-white hover:text-primary focus-visible:text-primary;
  }

  .group:first-child {
    @apply rounded-bl-lg rounded-tl-lg;
  }

  .group:not(:last-child) {
    @apply border-r-0;
  }

  .group:last-child {
    @apply rounded-br-lg rounded-tr-lg;
  }
</style>
