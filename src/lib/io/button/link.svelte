<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import { getButtonContext } from './context';
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
    colorScheme,
    size,
    children,
    tracking,
    LeadingIcon,
    TrailingIcon,
    ...rest
  }: ButtonLinkProps = $props();

  const buttonContext = getButtonContext();

  const resolvedColorScheme = $derived(
    colorScheme ?? buttonContext.colorScheme ?? 'primary',
  );

  const resolvedSize = $derived(size ?? buttonContext.size ?? 'md');

  const iconSize = $derived(resolvedSize === 'md' ? 16 : 12);
</script>

<a
  {...getTrackingAttributes(tracking, resolvedColorScheme)}
  {...rest}
  {href}
  class={buttonRecipe({
    colorScheme: resolvedColorScheme,
    size: resolvedSize,
    className,
  })}
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
</a>
