<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import type { IconComponent } from '$lib/io/icon';

  interface Props extends Omit<HTMLAnchorAttributes, 'class' | 'onclick'> {
    href: string;
    active?: boolean;
    interactive?: boolean;
    newTab?: boolean;
    class?: string;
    LeadingIcon?: IconComponent;
    TrailingIcon?: IconComponent;
    text?: string;
    light?: boolean;
    gotoParams?: Parameters<typeof goto>[1];
    'data-testid'?: string;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
  }

  let {
    class: className = '',
    href,
    active = false,
    interactive = false,
    newTab = false,
    LeadingIcon,
    TrailingIcon,
    text = '',
    light = false,
    gotoParams = {},
    children,
    onclick,
    ...rest
  }: Props = $props();

  const hasIcon = $derived(!!(LeadingIcon || TrailingIcon));

  const onLinkClick = (e: MouseEvent) => {
    if (e.button === 1 || newTab || e.metaKey || e.ctrlKey || e.shiftKey)
      return;

    e.preventDefault();
    goto(href, gotoParams);
  };

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    onLinkClick(event);
    onclick?.(event);
  };
</script>

<a
  {href}
  target={newTab ? '_blank' : null}
  rel={newTab ? 'noreferrer noopener' : null}
  class={merge('link', hasIcon ? 'inline-flex' : 'inline', className)}
  class:active
  class:interactive
  class:light
  data-track-name="link"
  data-track-intent="navigate"
  data-track-text={text || '*textContent*'}
  tabindex={href ? null : 0}
  {...rest}
  onclick={handleClick}
>
  {#if LeadingIcon}
    <LeadingIcon class="mt-0.5" />
  {/if}
  {#if text}
    {text}
  {/if}
  {@render children?.()}
  {#if TrailingIcon}
    <TrailingIcon class="mt-0.5" />
  {/if}
</a>

<style lang="postcss">
  .link {
    @apply max-w-fit cursor-pointer items-center gap-2 text-io-content-primary underline underline-offset-2 hover:text-io-content-brand focus-visible:text-io-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-io-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-io-background-primary;

    &.active {
      @apply text-io-content-brand;
    }

    &.interactive {
      @apply text-io-content-white hover:text-io-content-brand focus-visible:text-io-content-white;
    }

    &.light {
      @apply text-io-content-white hover:text-io-content-brand;
    }
  }

  .link[role='button'] {
    @apply no-underline;
  }
</style>
