<script lang="ts" module>
  export type BaseProps = {
    icon?: IconName;
    group?: boolean;
    active?: boolean;
    'data-testid'?: string;
    tooltip?: string;
    disabled?: boolean;
    href?: string | undefined;
    base?: string | undefined;
  };

  export type AnchorProps = BaseProps &
    HTMLAnchorAttributes & {
      href: string;
      base?: string;
    };

  export type ButtonProps = BaseProps &
    HTMLButtonAttributes & {
      href?: never;
      base?: never;
    };

  export type Props = AnchorProps | ButtonProps;
</script>

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

  let {
    class: className = '',
    icon = null,
    group = getAppContext('group'),
    href = '',
    base = href,
    active = false,
    tooltip = '',
    disabled = false,
    children,
    ...rest
  }: Props = $props();
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  class={merge('toggle-button', className)}
  class:group
  class:active={href ? $page.url.pathname.includes(base) : active}
  href={href ? href + $page.url.search : null}
  class:disabled
  role="button"
  tabindex="0"
  {...rest}
>
  <Tooltip hide={!tooltip} text={tooltip} top>
    {#if icon}
      <div class="flex items-center gap-2">
        <Icon name={icon} />
        {#if children}
          <span class="hidden md:block">{@render children()}</span>
        {/if}
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </Tooltip>
</svelte:element>

<style lang="postcss">
  .toggle-button {
    @apply surface-primary flex items-center justify-center border border-subtle px-4 py-2 text-sm leading-4 text-primary focus-visible:outline-none;

    &:not(.disabled) {
      @apply hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:ring-2 focus-visible:ring-primary/70;
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
