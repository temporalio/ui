<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import { Ark } from '@ark-ui/svelte/factory';

  import { buttonRecipe } from './recipe';
  import { getTrackingAttributes } from './tracking';

  import type { ButtonProps } from './button.svelte';

  export interface ButtonLinkProps
    extends
      Omit<HTMLAnchorAttributes, 'class'>,
      Pick<
        ButtonProps,
        | 'colorScheme'
        | 'size'
        | 'LeadingIcon'
        | 'TrailingIcon'
        | 'tracking'
        | 'class'
      > {}

  let {
    href,
    class: className,
    colorScheme = 'primary',
    size = 'md',
    children,
    tracking,
    LeadingIcon,
    TrailingIcon,
    ...rest
  }: ButtonLinkProps = $props();

  const iconSize = $derived(size === 'md' ? 16 : 12);
</script>

<Ark
  as="a"
  {...getTrackingAttributes(tracking, colorScheme)}
  {...rest}
  {href}
  class={buttonRecipe({ colorScheme, size, className })}
>
  {#if LeadingIcon}
    <LeadingIcon width={iconSize} height={iconSize} />
  {/if}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {#if TrailingIcon}
    <TrailingIcon width={iconSize} height={iconSize} />
  {/if}
</Ark>
