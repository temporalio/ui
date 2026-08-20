<script lang="ts">
  import type { Snippet } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import { type IconComponent } from '$lib/io/icon';

  interface Props {
    label: string;
    menuLabel: string;
    Icon?: IconComponent;
    id: string;
    disabled?: boolean;
    position?: 'left' | 'right';
    primaryActionDisabled?: boolean;
    href?: string;
    menuClass?: string;
    class?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    label,
    menuLabel,
    Icon,
    id,
    disabled = false,
    position = 'left',
    primaryActionDisabled = false,
    href,
    menuClass,
    class: className,
    onclick,
    children,
  }: Props = $props();
</script>

<MenuContainer class={className}>
  <div class="button-group flex h-10 cursor-pointer flex-row gap-[1px]">
    <Button
      disabled={disabled || primaryActionDisabled}
      id="{id}-primary-button"
      {href}
      disableTracking={true}
      data-track-name="split-button"
      data-track-intent="primary"
      data-track-text={label}
      {onclick}
    >
      {#if Icon}
        <Icon />
      {/if}
      {label}
    </Button>
    <MenuButton
      class="max-w-fit grow-0 px-3"
      id="{id}-menu-button"
      label={menuLabel}
      controls="{id}-menu"
      variant="primary"
      {disabled}
      hasIndicator
    />
  </div>

  <Menu id="{id}-menu" {position} class={menuClass}>
    {@render children?.()}
  </Menu>
</MenuContainer>
