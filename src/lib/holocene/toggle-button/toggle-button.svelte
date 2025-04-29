<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  import Tooltip from '../tooltip.svelte';

  type BaseProps = {
    icon?: IconName;
    group?: boolean;
    active?: boolean;
    'data-testid'?: string;
    tooltip?: string;
    class?: string;
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
  export let tooltip = '';
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  class={merge('toggle-button', className)}
  class:group
  class:active={href ? $page.url.pathname.includes(base) : active}
  href={href ? href + $page.url.search : null}
  class:disabled={$$restProps.disabled}
  on:click
  role="button"
  tabindex="0"
  {...$$restProps}
>
  <Tooltip hide={!tooltip} text={tooltip} top>
    {#if icon}
      <div class="flex items-center gap-2">
        <Icon name={icon} />
        {#if $$slots.default}
          <span class="hidden md:block"><slot /></span>
        {/if}
      </div>
    {:else}
      <slot />
    {/if}
  </Tooltip>
</svelte:element>

<style lang="postcss">
  @reference "tailwindcss";

  .toggle-button {
    @apply surface-primary border-subtle text-primary flex items-center justify-center border px-4 py-2 text-sm leading-4 focus-visible:outline-none;

    &:not(.disabled) {
      @apply hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:ring-primary/70 focus-visible:ring-2;
    }
  }

  .toggle-button.active {
    @apply bg-interactive-secondary-active;
  }

  .toggle-button.disabled {
    @apply cursor-not-allowed opacity-50;
  }

  .group:not(:last-child) {
    @apply border-r-0;
  }
</style>
