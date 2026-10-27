<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { IconComponent } from '$lib/io/icon';

  import type { ToggleSize } from './recipe';

  export interface ToggleProps extends Omit<
    HTMLButtonAttributes,
    'class' | 'children' | 'disabled' | 'id' | 'type' | 'value'
  > {
    pressed?: boolean;
    label?: string;
    Icon?: IconComponent;
    PressedIcon?: IconComponent;
    size?: ToggleSize;
    disabled?: boolean;
    id?: string;
    onPressedChange?: (pressed: boolean) => void;
    class?: string;
    children?: Snippet<[boolean]>;
  }
</script>

<script lang="ts">
  import { Toggle as ArkToggle } from '@ark-ui/svelte/toggle';

  import { toggleIconSize, toggleRecipe } from './recipe';

  let {
    pressed = $bindable(false),
    label = '',
    Icon,
    PressedIcon,
    size = 'md',
    disabled = false,
    onPressedChange,
    class: className,
    children,
    ...rest
  }: ToggleProps = $props();

  const Glyph = $derived(pressed && PressedIcon ? PressedIcon : Icon);
  const iconSize = $derived(toggleIconSize[size]);
</script>

<ArkToggle.Root
  bind:pressed
  {disabled}
  onPressedChange={(next) => onPressedChange?.(next)}
  data-track-name="toggle"
  data-track-intent="toggle"
  data-track-text={label || '*textContent*'}
  {...rest}
  class={toggleRecipe({ size, className })}
>
  {#if Glyph}
    <Glyph width={iconSize} height={iconSize} />
  {/if}
  {#if children}
    <span class="contents">{@render children(pressed)}</span>
  {:else if label}
    <span>{label}</span>
  {/if}
</ArkToggle.Root>
