<script lang="ts">
  import type { Snippet } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';

  interface Props {
    label: string;
    menuLabel: string;
    icon?: IconName;
    id: string;
    disabled?: boolean;
    position?: 'left' | 'right';
    primaryActionDisabled?: boolean;
    href?: string;
    menuClass?: string;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    label,
    menuLabel,
    icon,
    id,
    disabled = false,
    position = 'left',
    primaryActionDisabled = false,
    href,
    menuClass,
    class: className = '',
    onclick = () => {},
    children,
  }: Props = $props();
</script>

<MenuContainer class={className}>
  <div class="button-group flex h-10 cursor-pointer flex-row gap-[1px]">
    <Button
      disabled={disabled || primaryActionDisabled}
      id="{id}-primary-button"
      {href}
      {onclick}
    >
      {#if icon}
        <Icon name={icon} />
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
