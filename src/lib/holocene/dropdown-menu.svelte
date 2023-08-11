<script lang="ts">
  import MenuButton from './primitives/menu/menu-button.svelte';
  import MenuContainer from './primitives/menu/menu-container.svelte';
  import Menu from './primitives/menu/menu.svelte';

  export let id: string;
  export let position: 'right' | 'left' = 'left';
  export let label: string = null;
</script>

<MenuContainer let:open>
  <MenuButton {label} controls={id} class={$$restProps.buttonClass}>
    <slot name="trigger" />
  </MenuButton>
  <Menu {position} class="min-w-fit {$$restProps.menuClass}" {id}>
    <slot name="items" {open} />
  </Menu>
</MenuContainer>
