<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';

  export let label: string;
  export let menuLabel: string;
  export let icon: IconName | undefined = undefined;
  export let id: string;
  export let variant: 'primary' | 'secondary' | 'destructive' | 'ghost' =
    'primary';
  export let disabled = false;
  export let position: 'left' | 'right' = 'left';
  export let primaryActionDisabled = false;
</script>

<MenuContainer class={$$props.class}>
  <div class="split-button">
    <Button
      {variant}
      borderRadiusModifier="square-right"
      disabled={disabled || primaryActionDisabled}
      id="{id}-primary-button"
      on:click
    >
      {#if icon}
        <Icon name={icon} />
      {/if}
      {label}
    </Button>
    <MenuButton
      class="max-w-fit grow-0"
      id="{id}-menu-button"
      label={menuLabel}
      controls="{id}-menu"
      variant="primary"
      unroundLeft
      {disabled}
      hasIndicator
    />
  </div>

  <Menu id="{id}-menu" {position} class="w-full">
    <slot />
  </Menu>
</MenuContainer>

<style lang="postcss">
  .split-button {
    @apply flex h-10 cursor-pointer flex-row gap-[1px];
  }
</style>
