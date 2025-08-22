<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';

  export let label: string;
  export let menuLabel: string;
  export let icon: IconName | undefined = undefined;
  export let id: string;
  export let disabled = false;
  export let position: 'left' | 'right' = 'left';
  export let primaryActionDisabled = false;
  export let href: string | undefined = undefined;
  export let menuClass: string | undefined = undefined;
</script>

<MenuContainer class={$$props.class}>
  <div class="button-group flex h-10 cursor-pointer flex-row gap-[1px]">
    <Button
      disabled={disabled || primaryActionDisabled}
      id="{id}-primary-button"
      {href}
      disableTracking={true}
      data-track-name="split-button"
      data-track-intent="primary"
      data-track-text={label}
      on:click
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
    <slot />
  </Menu>
</MenuContainer>
