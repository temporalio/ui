<script lang="ts" module>
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import type { IconComponent } from '$lib/io/icon';

  export interface TextLinkProps extends Omit<HTMLAnchorAttributes, 'class'> {
    class?: string;
    disabled?: boolean;
    LeadingIcon?: IconComponent;
    TrailingIcon?: IconComponent;
  }
</script>

<script lang="ts">
  import { textLinkRecipe } from './recipe';

  let {
    href,
    class: className,
    disabled = false,
    LeadingIcon,
    TrailingIcon,
    children,
    onclick,
    tabindex,
    ...rest
  }: TextLinkProps = $props();
</script>

<a
  {...rest}
  href={disabled ? undefined : href}
  aria-disabled={disabled || rest['aria-disabled']}
  tabindex={disabled ? -1 : tabindex}
  class={textLinkRecipe({
    hasIcons: Boolean(LeadingIcon || TrailingIcon),
    isDisabled: disabled,
    className,
  })}
  onclick={(event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onclick?.(event);
  }}
>
  {#if LeadingIcon}
    <LeadingIcon width="1em" height="1em" />
  {/if}{@render children?.()}{#if TrailingIcon}
    <TrailingIcon width="1em" height="1em" />
  {/if}
</a>
