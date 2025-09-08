<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import { getAppContext } from '$lib/utilities/get-context';

  import type {
    ButtonWithHrefProps,
    ButtonWithoutHrefProps,
  } from '../button.svelte';
  import Button from '../button.svelte';

  type BaseProps = {
    group?: boolean;
    active?: boolean;
  };

  type AnchorProps = BaseProps &
    ButtonWithHrefProps & {
      base?: string;
    };

  type ButtonProps = BaseProps &
    ButtonWithoutHrefProps & {
      base?: never;
    };

  type $$Props = AnchorProps | ButtonProps;

  let className = '';
  export { className as class };
  export let group = getAppContext('group');
  export let href = null;
  export let base = href;
  export let active = false;
  export let variant: Button['variant'] = 'secondary';
</script>

<Button
  on:click
  class={merge(
    (href ? $page.url.pathname.includes(base) : active) &&
      'bg-interactive-secondary-active',
    group && '[&:not(:last-child)]:border-r-0',
    className,
  )}
  data-track-name="toggle-button"
  {variant}
  href={href ? href + $page.url.search : null}
  {...$$restProps}
>
  {#if $$restProps.leadingIcon}
    <span class="hidden md:block"><slot /></span>
  {:else}
    <slot />
  {/if}
</Button>
