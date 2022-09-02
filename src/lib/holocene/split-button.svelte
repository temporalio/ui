<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import Button from './button.svelte';

  export let label: string;
  export let id: string;
  export let disabled: boolean = false;
  export let position: 'left' | 'right' = 'left';
  export let href = '';

  let show: boolean = false;
</script>

<MenuContainer class={$$props.class}>
  <div class="split-button" class:disabled>
    <Button {href} variant="primary" {disabled} class="segment left" on:click>
      {label}
    </Button>
    <MenuButton dark class="segment right" bind:show controls={id} {disabled}>
      <Icon stroke="currentcolor" name="caretDown" />
    </MenuButton>
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
