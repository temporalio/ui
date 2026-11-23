<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { type IconComponent, IconSpinner } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  import type { ButtonColorScheme, ButtonSize } from './recipe';
  import type { TrackingOptions } from './tracking';

  export interface ButtonProps extends Omit<HTMLButtonAttributes, 'class'> {
    colorScheme?: ButtonColorScheme;
    size?: ButtonSize;
    LeadingIcon?: ConditionalValue<IconComponent>;
    TrailingIcon?: ConditionalValue<IconComponent>;
    isLoading?: boolean;
    tracking?: TrackingOptions;
    class?: string;
  }
</script>

<script lang="ts">
  import { getButtonContext } from './context';
  import { buttonRecipe } from './recipe';
  import { getTrackingAttributes } from './tracking';
  let {
    class: className,
    colorScheme,
    size,
    type = 'button',
    children,
    isLoading,
    tracking,
    LeadingIcon,
    TrailingIcon,
    ...rest
  }: ButtonProps = $props();

  const buttonContext = getButtonContext();

  const resolvedColorScheme = $derived(
    colorScheme ?? buttonContext.colorScheme ?? 'primary',
  );

  const resolvedSize = $derived(size ?? buttonContext.size ?? 'md');

  const iconSize = $derived(resolvedSize === 'md' ? 16 : 12);
</script>

{#snippet loadingIcon()}
  <IconSpinner class="animate-spin" width={iconSize} height={iconSize} />
{/snippet}

{#snippet leadingIcon()}
  {#if LeadingIcon}
    {#if isLoading}
      {@render loadingIcon()}
    {:else}
      <LeadingIcon width={iconSize} height={iconSize} />
    {/if}
  {/if}
{/snippet}

{#snippet trailingIcon()}
  {#if TrailingIcon && (LeadingIcon || !isLoading)}
    <TrailingIcon width={iconSize} height={iconSize} />
  {:else if !LeadingIcon && isLoading}
    {@render loadingIcon()}
  {/if}
{/snippet}

<button
  aria-busy={isLoading}
  {...getTrackingAttributes(tracking, resolvedColorScheme)}
  {...rest}
  {type}
  class={buttonRecipe({
    colorScheme: resolvedColorScheme,
    size: resolvedSize,
    className,
  })}
>
  {@render leadingIcon()}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {@render trailingIcon()}
</button>
