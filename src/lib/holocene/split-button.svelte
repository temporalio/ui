<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';

  export let label: string;
  export let id: string;
  export let disabled: boolean = false;
  export let left: boolean = false;
  export let right: boolean = false;
  export let href = '';

  let show: boolean = false;
</script>

<MenuContainer class={$$props.class}>
  <div class="split-button" class:disabled>
    {#if href}
      <a {href} class="segment rounded-l px-4">{label}</a>
    {:else}
      <button {disabled} class="segment rounded-l px-4" on:click>
        {label}
      </button>
    {/if}
    <MenuButton
      dark
      class="segment rounded-r px-2"
      bind:show
      controls={id}
      {disabled}
    >
      <Icon stroke="currentcolor" name="caretDown" />
    </MenuButton>
  </div>
  <Menu {id} {show} {left} {right}>
    <slot />
  </Menu>
</MenuContainer>

<style lang="postcss">
  .split-button {
    @apply flex grow cursor-pointer flex-row gap-[1px] font-secondary;

    :global(.segment) {
      @apply relative flex w-fit items-center justify-center bg-primary py-2 font-secondary text-sm text-white disabled:cursor-not-allowed disabled:opacity-50;
    }
  }
</style>
