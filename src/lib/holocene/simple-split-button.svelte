<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import type { IconName } from './icon/paths';

  export let label: string = '';
  export let icon: IconName | undefined = undefined;
  export let id: string;
  export let disabled: boolean = false;
  export let position: 'left' | 'right' = 'left';

  let show: boolean = false;
</script>

<MenuContainer class={$$props.class}>
  <div class="split-button" class:disabled>
    <slot name="middle-button" />
    <MenuButton
      class="segment right {$$props.buttonClass}"
      bind:show
      controls={id}
      {disabled}
    >
      {#if icon}
        <Icon name={icon} class="mr-2" />
      {/if}
      {label}
      <Icon name="chevron-down" class="ml-2" />
    </MenuButton>
  </div>
  <Menu class="min-w-max" {id} {show} {position}>
    <slot />
  </Menu>
</MenuContainer>

<style lang="postcss">
  .split-button {
    @apply flex h-10 grow cursor-pointer flex-row gap-[0px] font-secondary;

    :global(.segment) {
      @apply relative flex w-fit items-center justify-center py-2 font-secondary text-sm;
    }

    :global(.segment.left) {
      @apply rounded-none rounded-l px-2;
    }

    :global(.segment.right) {
      @apply rounded-r px-2;
    }

    :global() :global(.segment.right:disabled) {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
