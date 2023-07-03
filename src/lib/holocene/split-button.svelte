<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  
  import type { IconName } from './icon/paths';
  
  import Button from './button.svelte';

  export let label = '';
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

  let show = false;
</script>

<MenuContainer class={$$props.class}>
  <div class="split-button" class:disabled>
    <Button
      {href}
      {variant}
      {thin}
      disabled={disabled || primaryActionDisabled}
      id="{id}-primary-button"
      class="segment left"
      on:click
    >
      {#if icon}
        <Icon name={icon} />
      {/if}
      {label}
    </Button>
    <MenuButton
      id="{id}-menu-button"
      dark
      class="segment right"
      bind:show
      controls="{id}-menu"
      {disabled}
      hasIndicator
    />
  </div>
  <Menu class="min-w-max" id="{id}-menu" {show} {position}>
    <slot />
  </Menu>
</MenuContainer>

<style lang="postcss">
  .split-button {
    @apply flex grow cursor-pointer flex-row gap-[1px] font-secondary;

    :global(.segment) {
      @apply relative flex w-fit items-center justify-center py-2 font-secondary text-sm;
    }

    :global(.segment.left) {
      @apply rounded-none rounded-l px-4;
    }

    :global(.segment.right) {
      @apply rounded-r px-2;
    }

    :global(.segment.right:disabled) {
      @apply cursor-not-allowed opacity-50;
    }

    :global(.segment.right:enabled) {
      @apply border-2 border-gray-900 from-blue-100 to-purple-100 hover:bg-gradient-to-br hover:text-gray-900;
    }
  }
</style>
