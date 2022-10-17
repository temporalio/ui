<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import Button from './button.svelte';
  import type { IconName } from './icon/paths';

  export let label: string = '';
  export let icon: IconName | undefined = undefined;
  export let id: string;
  export let variant:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'login'
    | 'link' = 'primary';
  export let thin = false;
  export let disabled: boolean = false;
  export let position: 'left' | 'right' = 'left';
  export let href = '';

  let show: boolean = false;
</script>

<MenuContainer class={$$props.class}>
  <div class="split-button" class:disabled>
    <Button {href} {variant} {thin} {disabled} class="segment left" on:click>
      {#if icon}
        <Icon name={icon} />
      {/if}
      {label}
    </Button>
    <MenuButton
      dark
      class="segment right"
      bind:show
      controls={id}
      {disabled}
      hasIndicator
    />
  </div>
  <Menu class="min-w-max" {id} {show} {position}>
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
      @apply hover:bg-blue-700 hover:text-gray-100;
    }
  }
</style>
