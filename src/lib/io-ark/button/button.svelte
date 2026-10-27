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
  import { Ark } from '@ark-ui/svelte/factory';

  import { buttonRecipe } from './recipe';
  import { getTrackingAttributes } from './tracking';

  let {
    class: className,
    colorScheme = 'primary',
    size = 'md',
    type = 'button',
    children,
    isLoading,
    tracking,
    LeadingIcon,
    TrailingIcon,
    ...rest
  }: ButtonProps = $props();

  const iconSize = $derived(size === 'md' ? 16 : 12);
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

<Ark
  as="button"
  aria-busy={isLoading}
  {...getTrackingAttributes(tracking, colorScheme)}
  {...rest}
  {type}
  class={buttonRecipe({ colorScheme, size, className })}
>
  {@render leadingIcon()}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {@render trailingIcon()}
</Ark>
