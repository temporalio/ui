<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  import Tooltip from '../tooltip.svelte';

  type BaseProps = {
    icon?: IconName;
    group?: boolean;
    active?: boolean;
    disabled?: boolean;
    'data-testid'?: string;
    tooltip?: string;
    showLabelOnSmallScreens?: boolean;
    class?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  };

  type AnchorProps = BaseProps &
    Omit<HTMLAnchorAttributes, 'class' | 'onclick' | 'children'> & {
      href: string;
      base?: string;
    };

  type ButtonProps = BaseProps &
    Omit<HTMLButtonAttributes, 'class' | 'onclick' | 'children'> & {
      href?: never;
      base?: never;
    };

  type Props = AnchorProps | ButtonProps;

  let {
    class: className = '',
    icon,
    group = getAppContext('group'),
    href = '',
    base,
    active = false,
    tooltip = '',
    showLabelOnSmallScreens = false,
    disabled,
    onclick,
    children,
    ...rest
  }: Props = $props();

  const resolvedBase = $derived(base ?? href);
  const pressed = $derived(
    href ? page.url.pathname.includes(resolvedBase) : active,
  );
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  class={merge('toggle-button', className)}
  class:group
  class:active={pressed}
  aria-pressed={href ? undefined : pressed}
  aria-current={href && pressed ? 'page' : undefined}
  href={href ? href + page.url.search : null}
  class:disabled
  data-track-name="tab-button"
  data-track-intent="select"
  data-track-text="*textContent*"
  {onclick}
  role="button"
  tabindex="0"
  type={href ? undefined : 'button'}
  {disabled}
  {...rest}
>
  <Tooltip hide={!tooltip} text={tooltip} top>
    {#if icon}
      <div class="flex items-center gap-2">
        <Icon name={icon} />
        {#if children}
          <span class={showLabelOnSmallScreens ? undefined : 'hidden md:block'}
            >{@render children()}</span
          >
        {/if}
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </Tooltip>
</svelte:element>

<style lang="postcss">
  .toggle-button {
    @apply flex h-control-sm items-center justify-center rounded-control border border-subtle px-3 text-xs font-medium leading-4 text-secondary transition-colors duration-fast focus-visible:outline-none;

    &:not(.disabled) {
      @apply hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:ring-2 focus-visible:ring-primary;
    }
  }

  .toggle-button.active {
    @apply surface-primary border-subtle text-primary shadow-raised;
  }

  .toggle-button.disabled {
    @apply cursor-not-allowed opacity-50;
  }
</style>
