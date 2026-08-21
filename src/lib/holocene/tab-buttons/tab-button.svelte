<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { type IconComponent } from '$lib/io/icon';
  import { getAppContext } from '$lib/utilities/get-context';

  import Tooltip from '../tooltip.svelte';

  type BaseProps = {
    Icon?: IconComponent;
    group?: boolean;
    active?: boolean;
    disabled?: boolean;
    'data-testid'?: string;
    tooltip?: string;
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
    Icon,
    group = getAppContext('group'),
    href = '',
    base,
    active = false,
    tooltip = '',
    disabled,
    onclick,
    children,
    ...rest
  }: Props = $props();

  const resolvedBase = $derived(base ?? href);
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  class={merge('toggle-button', className)}
  class:group
  class:active={href ? page.url.pathname.includes(resolvedBase) : active}
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
    {#if Icon}
      <div class="flex items-center gap-2">
        <Icon />
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
    @apply flex items-center justify-center rounded-t border border-b-0 border-subtle/0 px-4 py-2 text-sm leading-4 text-primary focus-visible:outline-none;

    &:not(.disabled) {
      @apply hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:ring-2 focus-visible:ring-primary/70;
    }
  }

  .toggle-button.active {
    @apply surface-primary border-subtle/100;
  }

  .toggle-button.disabled {
    @apply cursor-not-allowed opacity-50;
  }
</style>
