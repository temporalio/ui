<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import MenuContainer from './primatives/menu/menu-container.svelte';
  import MenuButton from './primatives/menu/menu-button.svelte';
  import Menu from './primatives/menu/menu.svelte';
  export let label: string;
  export let id: string;
  export let disabled: boolean = false;
  export let left: boolean = false;
  export let right: boolean = false;

  let show: boolean = false;
</script>

<MenuContainer class={$$props.class}>
  <MenuButton bind:show controls={id} class={$$props.class} {disabled} on:click>
    <div class="split-button" class:disabled>
      <button tabindex="-1" {disabled} class="segment rounded-l px-4">
        {label}
      </button>
      <div class="segment rounded-r px-2">
        <Icon stroke="currentcolor" name="caretDown" />
      </div>
    </div>
  </MenuButton>
  <Menu class="split-button-menu" {id} {show} {left} {right}>
    <slot />
  </Menu>
</MenuContainer>

<style lang="postcss">
  .split-button {
    @apply flex grow cursor-pointer flex-row gap-[1px] font-secondary;
  }

  .split-button.disabled {
    @apply cursor-not-allowed opacity-50;
  }

  :global(.split-button-menu) {
    @apply flex min-w-max flex-col items-start gap-y-4 border-gray-300 p-3 px-6 font-secondary text-sm;
  }

  .segment {
    @apply inline-block bg-gray-900 py-2 text-sm text-white shadow;
  }
</style>
