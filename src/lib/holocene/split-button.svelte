<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';

  export let label: string;
  export let menuLabel: string;
  export let icon: IconName | undefined = undefined;
  export let id: string;
  export let variant:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'login'
    | 'link' = 'primary';
  export let thin = false;
  export let disabled = false;
  export let position: 'left' | 'right' = 'left';
  export let href = '';
  export let primaryActionDisabled = false;
</script>

<div class="split-button">
  <Button
    {href}
    {variant}
    {thin}
    unroundRight
    disabled={disabled || primaryActionDisabled}
    id="{id}-primary-button"
    on:click
  >
    {#if icon}
      <Icon name={icon} />
    {/if}
    {label}
  </Button>
  <MenuContainer class={$$props.class}>
    <MenuButton
      id="{id}-menu-button"
      label={menuLabel}
      controls="{id}-menu"
      variant="primary"
      unroundLeft
      {disabled}
      hasIndicator
    />
    <Menu id="{id}-menu" {position}>
      <slot />
    </Menu>
  </MenuContainer>
</div>

<style lang="postcss">
  .split-button {
    @apply flex h-10 cursor-pointer flex-row gap-[1px];
  }
</style>
